import { InputRegion, RankedRegion } from "@/types/regions";
import { MainTableRow } from "@/types/rows";
import { indexBy, rankSorted } from "./rank";

/** Rank 0 for every region: used when a category is turned off. */
export const zeroRanks = (regions: readonly InputRegion[]): RankedRegion[] =>
    regions.map(({ chr, start, end, regionID }) => ({ chr, start, end, regionID, rank: 0 }));

/** Placeholder for a missing category rank, so it sorts after every real rank. */
const MISSING_RANK = 1_000_000;

export type CategoryRanks = {
    sequence: RankedRegion[];
    element: RankedRegion[];
    gene: RankedRegion[];
};

/**
 * Combines the per-category ranks into the main table rows, sorted by aggregate rank.
 * The aggregate rank orders regions by the sum of their category ranks (ties share a rank).
 */
export function computeMainRows(regions: readonly InputRegion[], ranks: CategoryRanks): MainTableRow[] {
    if (regions.length === 0) return [];
    if (ranks.sequence.length === 0 && ranks.element.length === 0 && ranks.gene.length === 0) return [];

    const sequence = indexBy(ranks.sequence, (r) => r.regionID);
    const element = indexBy(ranks.element, (r) => r.regionID);
    const gene = indexBy(ranks.gene, (r) => r.regionID);

    const totals = regions.map((region) => {
        const key = region.regionID;
        const total =
            (sequence.get(key)?.rank || MISSING_RANK) +
            (element.get(key)?.rank || MISSING_RANK) +
            (gene.get(key)?.rank || MISSING_RANK);
        return { region, total };
    });

    const aggregate = indexBy(
        rankSorted(totals, (a, b) => a.total - b.total, (t) => t.total).map(({ item, rank }) => ({
            key: item.region.regionID,
            rank: item.total === 0 ? 0 : rank,
        })),
        (a) => a.key
    );

    return regions
        .map((region) => {
            const key = region.regionID;
            return {
                regionID: region.regionID,
                inputRegion: { chr: region.chr, start: region.start, end: region.end },
                ref: region.ref,
                alt: region.alt,
                sequenceRank: sequence.get(key)?.rank ?? 0,
                elementRank: element.get(key)?.rank ?? 0,
                geneRank: gene.get(key)?.rank ?? 0,
                aggregateRank: aggregate.get(key)?.rank ?? 0,
            };
        })
        .filter((row) => row.aggregateRank !== 0)
        .sort((a, b) => a.aggregateRank - b.aggregateRank);
}
