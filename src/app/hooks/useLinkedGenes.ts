import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { CLOSEST_QUERY, COMPUTATIONAL_LNKED_GENES_QUERY, LINKED_GENES_QUERY } from '../queries';
import { client } from '../client';
import { ComputationalMethod, GeneFilterState } from '../types';
import { computationalMethods } from '../submitted/[submitted]/tables/genes/geneHelpers';

interface UseLinkedGenesArgs {
    intersectingCcres?: Array<{
        accession: string;
    }>;
    geneFilterVariables: GeneFilterState;
}

export const useLinkedGenes = ({
    intersectingCcres,
    geneFilterVariables,
}: UseLinkedGenesArgs) => {
    const accessions = useMemo(
        () => intersectingCcres?.map(c => c.accession) ?? [],
        [intersectingCcres]
    );

    const isDistance =
        geneFilterVariables.methodOfLinkage === 'distance';
    const isEqtl =
        geneFilterVariables.methodOfLinkage === 'eQTLs';

    //Closest genes (distance)
    const closestGenesQuery = useQuery(CLOSEST_QUERY, {
        variables: { accessions },
        skip: !intersectingCcres || !isDistance,
        client,
        fetchPolicy: 'cache-first',
    });

    //Linked genes (non-distance, non-computational)
    const linkedGenesVariables = useMemo(() => {
        if (isEqtl) {
            return {
                accession: accessions,
                assembly: 'grch38',
                tissue: geneFilterVariables.linkageBiosample
                    ? geneFilterVariables.linkageBiosample.displayname
                    : [],
                method: 'eQTLs',
            };
        }

        return {
            accession: accessions,
            assembly: 'grch38',
            celltype: geneFilterVariables.linkageBiosample
                ? geneFilterVariables.linkageBiosample.cellType
                : [],
            assaytype: geneFilterVariables.methodOfLinkage.replace('_', '-'),
        };
    }, [
        accessions,
        isEqtl,
        geneFilterVariables.linkageBiosample,
        geneFilterVariables.methodOfLinkage,
    ]);

    const linkedGenesQuery = useQuery(LINKED_GENES_QUERY, {
        variables: linkedGenesVariables,
        skip:
            !intersectingCcres ||
            isDistance ||
            computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod),
        client,
        fetchPolicy: 'cache-first',
    });

    //Computational linked genes
    const computationalGenesQuery = useQuery(
        COMPUTATIONAL_LNKED_GENES_QUERY,
        {
            variables: {
                accession: accessions,
                biosample_value:
                    geneFilterVariables.linkageBiosample
                        ? geneFilterVariables.linkageBiosample.name
                        : [],
                method: geneFilterVariables.methodOfLinkage,
            },
            skip:
                !intersectingCcres ||
                !computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod),
            client,
            fetchPolicy: 'cache-first',
        }
    );

    return {
        closest: {
            loading: closestGenesQuery.loading,
            data: closestGenesQuery.data,
            error: closestGenesQuery.error,
        },
        linked: {
            loading: linkedGenesQuery.loading,
            data: linkedGenesQuery.data,
            error: linkedGenesQuery.error,
        },
        computational: {
            loading: computationalGenesQuery.loading,
            data: computationalGenesQuery.data,
            error: computationalGenesQuery.error,
        },
        loading:
            closestGenesQuery.loading ||
            linkedGenesQuery.loading ||
            computationalGenesQuery.loading,
        error:
            closestGenesQuery.error ||
            linkedGenesQuery.error ||
            computationalGenesQuery.error,
    };
};
