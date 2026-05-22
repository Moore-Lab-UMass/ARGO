import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { BIOSAMPLE_Z_SCORES_QUERY, MAX_Z_SCORES_QUERY, ORTHOLOG_QUERY } from '../queries';
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

    const accessionList =
        elementFilterVariables.cCREAssembly === 'mm10'
            ? mouseAccessions
            : intersectingCcres
                ? intersectingCcres.map(ccre => ccre.accession)
                : [];

    //Max z-scores query (always runs)
    const maxZScoresQuery = useQuery(MAX_Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accession: accessionList,
        },
        skip:
            !intersectingCcres ||
            (elementFilterVariables.cCREAssembly === 'mm10' &&
                !mouseAccessions),
        fetchPolicy: 'cache-first',
    });

    //Biosample-specific z-scores query (only when a biosample is selected)
    const biosampleZScoresQuery = useQuery(BIOSAMPLE_Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accession: accessionList,
            biosample_value: elementFilterVariables.selectedBiosample
                ? [elementFilterVariables.selectedBiosample.name]
                : [],
        },
        skip:
            !intersectingCcres ||
            !elementFilterVariables.selectedBiosample ||
            (elementFilterVariables.cCREAssembly === 'mm10' &&
                !mouseAccessions),
        fetchPolicy: 'cache-first',
    });

    return {
        ortho: {
            loading: orthoQuery.loading,
            data: orthoQuery.data,
            error: orthoQuery.error,
        },
        maxZScores: {
            loading: maxZScoresQuery.loading,
            data: maxZScoresQuery.data,
            error: maxZScoresQuery.error,
        },
        biosampleZScores: {
            loading: biosampleZScoresQuery.loading,
            data: biosampleZScoresQuery.data,
            error: biosampleZScoresQuery.error,
        },
        loading: orthoQuery.loading || maxZScoresQuery.loading || biosampleZScoresQuery.loading,
        error: orthoQuery.error || maxZScoresQuery.error || biosampleZScoresQuery.error,
    };
};
