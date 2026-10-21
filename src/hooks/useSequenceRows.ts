import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { CONSERVATION_TRACKS } from "@/lib/constants";
import { ALLELE_QUERY, MOTIF_RANKING_QUERY } from "@/lib/graphql/queries";
import { buildSequenceRows } from "@/lib/ranking/sequence";
import { SequenceFilterState } from "@/types/filters";
import { InputRegion } from "@/types/regions";
import { SequenceTableRow } from "@/types/rows";

const EMPTY: SequenceTableRow[] = [];

type Options = {
    /**
     * Keep results from the query that succeeded when the other one fails.
     * The results page shows no sequence rows on any error; Compass keeps partial rows.
     */
    keepPartial?: boolean;
};

/** Conservation and motif scores for each region. */
export function useSequenceRows(regions: InputRegion[], filters: SequenceFilterState, { keepPartial = false }: Options = {}) {
    const enabled = filters.useConservation || filters.useMotifs;

    const conservationVariables = useMemo(
        () => ({
            requests: {
                url: CONSERVATION_TRACKS[filters.alignment].url,
                regions: regions.map(({ chr, start, end }) => ({ chr1: chr, start, end })),
            },
        }),
        [filters.alignment, regions]
    );
    const conservation = useQuery(ALLELE_QUERY, {
        variables: conservationVariables,
        skip: !filters.useConservation || regions.length === 0,
    });

    const motifVariables = useMemo(
        () => ({
            motifinputs: regions.map((r) => ({
                regionid: r.regionID.toString(),
                start: r.start,
                end: r.end,
                chrom: r.chr,
                alt: r.alt,
                ref: r.ref,
            })),
        }),
        [regions]
    );
    const motifs = useQuery(MOTIF_RANKING_QUERY, {
        variables: motifVariables,
        skip: !filters.useMotifs || regions.length === 0,
    });

    const loading = enabled && (conservation.loading || motifs.loading);
    const error = conservation.error ?? motifs.error;

    const rows = useMemo(() => {
        if (!enabled || loading || (error && !keepPartial)) return EMPTY;
        if (!conservation.data && !motifs.data) return EMPTY;
        return buildSequenceRows({ regions, conservationData: conservation.data, motifData: motifs.data, filters });
    }, [enabled, loading, error, keepPartial, conservation.data, motifs.data, regions, filters]);

    return { rows, loading, error };
}
