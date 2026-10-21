import { BigRequestsMultipleRegionsSequenceQuery, MotifRankingQueryQuery } from "@/graphql/__generated__/graphql";
import { DataSource, MotifQuality, SequenceFilterState } from "@/types/filters";
import { InputRegion, RankedRegion } from "@/types/regions";
import { SequenceTableRow } from "@/types/rows";
import { zeroRanks } from "./aggregate";
import { coordKey, groupBy, indexBy, rankSorted } from "./rank";

type ConservationRequest = BigRequestsMultipleRegionsSequenceQuery["bigRequestsMultipleRegions"][number];
type MotifResult = MotifRankingQueryQuery["motifranking"][number];

/** Value used for regions without a conservation score, so they sort last. */
const NO_CONSERVATION_SCORE = -1_000_000;

/** Motif IDs look like `NAME.H14CORE.0.PSM.A`: the 4th part is the data source letters, the last part the quality. */
const motifDataSource = (motifID: string) => motifID.split(".")[3];
const motifQuality = (motifID: string) => motifID.split(".").pop();

/** One conservation score per region, summarised by min, max or average over its bases. */
function conservationScores(requests: ConservationRequest[], rankBy: string, regions: InputRegion[]): SequenceTableRow[] {
    const byCoords = indexBy(regions, coordKey);
    // NOTE: start/end corrections below match on position only (any chromosome), which preserves
    // existing behavior; see refactor plan Phase 6.
    const byStart = indexBy(regions, (r) => r.start);
    const byEnd = indexBy(regions, (r) => r.end);

    return requests
        .filter((request) => request.data?.length > 0)
        .map((request) => {
            const data = request.data;
            const first = data[0];
            const last = data[data.length - 1];

            // The query's first item is one base before the region, so the region spans
            // from the first item's end to the last item's end.
            const chr = first?.chr || "";
            let start = first?.end || 0;
            let end = last?.end || 0;

            // Some tracks return multi-base items; find the real start/end among the input regions.
            if (first.end - first.start > 1) {
                for (let i = first.start; i < first.end; i++) {
                    if (byStart.has(i)) {
                        start = i;
                        break;
                    }
                }
            }
            if (last.end - last.start > 1) {
                for (let i = last.start; i < last.end; i++) {
                    if (byEnd.has(i)) {
                        end = i;
                        break;
                    }
                }
            }

            const values: number[] = data.map((item) => item.value);
            let score: number;
            if (rankBy === "max") score = Math.max(...values);
            else if (rankBy === "min") score = Math.min(...values);
            else score = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;

            return {
                regionID: byCoords.get(coordKey({ chr, start, end }))?.regionID,
                inputRegion: { chr, start, end },
                conservationScore: score,
            } as SequenceTableRow;
        });
}

/** Keeps motifs whose quality and data source are enabled in the filters. */
function filterMotifs(motifs: MotifResult[], filters: SequenceFilterState) {
    return motifs
        .filter((motif) => {
            const quality = motifQuality(motif.motif);
            const sources = motifDataSource(motif.motif);
            return (
                filters.motifQuality[quality.toLowerCase() as keyof MotifQuality] &&
                sources.split("").some((letter) => filters.dataSource[letter.toLowerCase() as keyof DataSource])
            );
        })
        .map((motif) => ({ ...motif, ref: Number(motif.ref) }));
}

/** Motif data per region: the motif with the largest absolute score change, plus all overlapping motifs. */
function motifSummaries(regions: InputRegion[], motifs: ReturnType<typeof filterMotifs>) {
    const byRegion = groupBy(motifs, (m) => m.regionid);
    return regions.map((region) => {
        const matching = byRegion.get(region.regionID.toString()) ?? [];
        const best = matching.length > 0
            ? matching.reduce((max, curr) => (Math.abs(curr.diff) > Math.abs(max.diff) ? curr : max))
            : null;
        return { region, matching, best };
    });
}

type BuildSequenceRowsArgs = {
    regions: InputRegion[];
    conservationData?: BigRequestsMultipleRegionsSequenceQuery;
    motifData?: MotifRankingQueryQuery;
    filters: SequenceFilterState;
};

/** One sequence table row per input region, combining conservation and motif results. */
export function buildSequenceRows({ regions, conservationData, motifData, filters }: BuildSequenceRowsArgs): SequenceTableRow[] {
    const conservation = conservationData
        ? indexBy(conservationScores(conservationData.bigRequestsMultipleRegions, filters.rankBy, regions), (row) => row.regionID)
        : new Map<SequenceTableRow["regionID"], SequenceTableRow>();

    const motifs = motifData ? motifSummaries(regions, filterMotifs(motifData.motifranking, filters)) : null;
    const best = indexBy((motifs ?? []).filter((m) => m.best), (m) => m.region.regionID);
    const overlapping = motifData && filters.numOverlappingMotifs
        ? indexBy(motifs ?? [], (m) => m.region.regionID)
        : new Map<SequenceTableRow["regionID"], NonNullable<typeof motifs>[number]>();

    return regions.map((region) => {
        const bestMotif = best.get(region.regionID);
        const overlap = overlapping.get(region.regionID);
        return {
            regionID: region.regionID,
            inputRegion: region,
            conservationScore: conservation.get(region.regionID)?.conservationScore ?? NO_CONSERVATION_SCORE,
            motifScoreDelta: bestMotif ? Math.abs(bestMotif.best.diff) : undefined,
            referenceAllele: bestMotif
                ? { sequence: bestMotif.region.ref, score: bestMotif.best.ref }
                : { sequence: region.ref },
            alt: bestMotif
                ? { sequence: bestMotif.region.alt, score: bestMotif.best.alt }
                : { sequence: region.alt },
            motifID: bestMotif?.best.motif,
            numOverlappingMotifs: overlap?.matching.length,
            motifs: overlap?.matching.map((motif) => ({
                referenceAllele: { sequence: overlap.region.ref, score: motif.ref },
                alt: { sequence: overlap.region.alt, score: motif.alt },
                diff: Math.abs(motif.diff),
                motifID: motif.motif,
            })),
        };
    });
}

/**
 * Ranks regions by the sum of three sub-ranks: conservation score, motif score delta
 * and number of overlapping motifs (higher is better for each).
 */
export function rankSequence(rows: SequenceTableRow[], filters: SequenceFilterState, regions: InputRegion[]): RankedRegion[] {
    if (!filters.useConservation && !filters.useMotifs) return zeroRanks(regions);
    if (rows.length === 0) return [];

    const subRank = (value: (row: SequenceTableRow) => number) =>
        indexBy(
            rankSorted(rows, (a, b) => value(b) - value(a), value),
            (r) => r.item.regionID
        );
    const conservation = subRank((row) => row.conservationScore);
    const delta = subRank((row) => row.motifScoreDelta!);
    const overlapping = subRank((row) => row.numOverlappingMotifs!);

    const totals = rows.map((row) => ({
        row,
        total:
            (conservation.get(row.regionID)?.rank ?? rows.length) +
            (delta.get(row.regionID)?.rank ?? rows.length) +
            (overlapping.get(row.regionID)?.rank ?? rows.length),
    }));

    return rankSorted(totals, (a, b) => a.total - b.total, (t) => t.total).map(({ item, rank }) => ({
        chr: item.row.inputRegion.chr,
        start: item.row.inputRegion.start,
        end: item.row.inputRegion.end,
        rank,
    }));
}
