import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GENE_EXP_QUERY, SPECIFICITY_QUERY } from '../queries';
import { AllLinkedGenes, GeneFilterState } from '../types';
import { client } from '../client';
import { AggregateByEnum } from '../../graphql/__generated__/graphql';

interface UseGeneScoresArgs {
    filteredGenes: AllLinkedGenes;
    geneFilterVariables: GeneFilterState;
}

export const useGeneScores = ({
    filteredGenes,
    geneFilterVariables,
}: UseGeneScoresArgs) => {
    const geneIds = useMemo(
        () =>
            filteredGenes?.flatMap(entry =>
                entry.genes.map(g =>
                    g.geneId.split('.')[0]
                )
            ),
        [filteredGenes]
    );

    //Gene specificity
    const specificityQuery = useQuery(SPECIFICITY_QUERY, {
        variables: {
            geneids: geneIds,
        },
        skip: filteredGenes === null,
        client,
        fetchPolicy: 'cache-first',
    });

    //Gene expression
    const expressionQuery = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: geneIds,
            biosample: geneFilterVariables.selectedBiosample
                ? geneFilterVariables.selectedBiosample.name
                : [],
            aggregateBy:
                (geneFilterVariables.rankGeneExpBy === 'avg'
                    ? 'AVERAGE'
                    : 'MAX') as AggregateByEnum,
        },
        skip: filteredGenes === null,
        client,
        fetchPolicy: 'cache-first',
    });

    return {
        specificity: {
            loading: specificityQuery.loading,
            data: specificityQuery.data,
        },
        expression: {
            loading: expressionQuery.loading,
            data: expressionQuery.data,
            error: expressionQuery.error,
        },
        loading:
            specificityQuery.loading ||
            expressionQuery.loading,
    };
};
