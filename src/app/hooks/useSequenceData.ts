import { useQuery } from '@apollo/client';
import { SequenceFilterState } from '../types';
import { client } from '../client';
import { ALLELE_QUERY, MOTIF_RANKING_QUERY } from '../queries';

interface UseSequenceDataArgs {
    inputRegions: Array<{
        chr: string;
        start: number;
        end: number;
        regionID: number | string;
        ref?: string;
        alt?: string;
    }>;
    sequenceFilterVariables: SequenceFilterState;
}

const urlMapping: { [key: string]: string } = {
    "241-mam-phyloP": "https://downloads.wenglab.org/241-mammalian-2020v2.bigWig",
    "241-mam-phastCons": "https://downloads.wenglab.org/241Mammals-PhastCons.bigWig",
    "447-mam-phyloP": "https://downloads.wenglab.org/mammals_phyloP-447.bigWig",
    "100-vert-phyloP": "https://downloads.wenglab.org/hg38.phyloP100way.bw",
    "100-vert-phastCons": "https://downloads.wenglab.org/hg38.phastCons100way.bw",
    "243-prim-phastCons": "https://downloads.wenglab.org/primates_PhastCons-243.bigWig",
    "43-prim-phyloP": "https://downloads.wenglab.org/PhyloP-43.bw",
    "43-prim-phastCons": "https://downloads.wenglab.org/hg38_43primates_phastCons.bw",
};

export const useSequenceData = ({
    inputRegions,
    sequenceFilterVariables,
}: UseSequenceDataArgs) => {
    const conservationQuery = useQuery(ALLELE_QUERY, {
        variables: {
            requests: {
                url: urlMapping[sequenceFilterVariables.alignment],
                regions: inputRegions.map(({ chr, start, end }) => ({
                    chr1: chr,
                    start,
                    end,
                })),
            },
        },
        skip:
            !sequenceFilterVariables.useConservation ||
            inputRegions.length === 0,
        client,
        fetchPolicy: 'cache-first',
    });

    const motifRankingQuery = useQuery(MOTIF_RANKING_QUERY, {
        variables: {
            motifinputs: inputRegions.map(region => ({
                regionid: region.regionID.toString(),
                start: region.start,
                end: region.end,
                chrom: region.chr,
                alt: region.alt,
                ref: region.ref,
            })),
        },
        skip: !sequenceFilterVariables.useMotifs,
        client,
        fetchPolicy: 'cache-first',
    });

    return {
        conservation: {
            loading: conservationQuery.loading,
            data: conservationQuery.data,
            error: conservationQuery.error,
        },
        motifs: {
            loading: motifRankingQuery.loading,
            data: motifRankingQuery.data,
            error: motifRankingQuery.error,
        },
        loading:
            conservationQuery.loading || motifRankingQuery.loading,
        error:
            conservationQuery.error || motifRankingQuery.error,
    };
};
