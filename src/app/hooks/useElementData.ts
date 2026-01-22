import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { client } from '../client';
import { ORTHOLOG_QUERY, Z_SCORES_QUERY } from '../queries';
import { ElementFilterState } from '../types';

interface UseElementDataArgs {
    intersectingCcres?: Array<{
        accession: string;
    }>;
    elementFilterVariables: ElementFilterState;
}

export const useElementData = ({
    intersectingCcres,
    elementFilterVariables,
}: UseElementDataArgs) => {
    //Ortholog query (human → mouse)
    const orthoQuery = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: 'GRCh38',
            accessions: intersectingCcres
                ? intersectingCcres.map(ccre => ccre.accession)
                : [],
        },
        skip:
            (!elementFilterVariables.mustHaveOrtholog &&
                elementFilterVariables.cCREAssembly !== 'mm10') ||
            !intersectingCcres,
        client,
        fetchPolicy: 'cache-first',
    });

    const mouseAccessions = useMemo(() => {
        if (elementFilterVariables.cCREAssembly !== 'mm10') return undefined;

        return orthoQuery.data?.orthologQuery
            ?.flatMap(entry => entry.ortholog)
            .map(orthologEntry => orthologEntry.accession);
    }, [
        elementFilterVariables.cCREAssembly,
        orthoQuery.data?.orthologQuery,
    ]);

    //Z-score query
    const zScoreQuery = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions:
                elementFilterVariables.cCREAssembly === 'mm10'
                    ? mouseAccessions
                    : intersectingCcres
                          ? intersectingCcres.map(ccre => ccre.accession)
                          : [],
            cellType: elementFilterVariables.selectedBiosample
                ? elementFilterVariables.selectedBiosample.name
                : null,
        },
        skip:
            !intersectingCcres ||
            (elementFilterVariables.cCREAssembly === 'mm10' &&
                !mouseAccessions),
        client,
        fetchPolicy: 'cache-first',
    });

    return {
        ortho: {
            loading: orthoQuery.loading,
            data: orthoQuery.data,
            error: orthoQuery.error,
        },
        zScores: {
            loading: zScoreQuery.loading,
            data: zScoreQuery.data,
            error: zScoreQuery.error,
        },
        loading: orthoQuery.loading || zScoreQuery.loading,
        error: orthoQuery.error || zScoreQuery.error,
    };
};
