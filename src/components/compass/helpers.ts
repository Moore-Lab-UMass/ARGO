import { compassCategory } from "@/lib/regions/parse";
import { MainTableRow } from "@/types/rows";

/**
 * For each x, the share of pathogenic vs benign variants among those ranked at or before x.
 * `variants` must be sorted by rank.
 */
export function buildPercentageSteps(variants: { rank: number; type: string }[], xs: number[]) {
    let pathogenicCount = 0;
    let benignCount = 0;
    let next = 0;
    const pathogenicPct: number[] = [];
    const benignPct: number[] = [];

    for (const x of xs) {
        while (next < variants.length && variants[next].rank <= x) {
            if (variants[next].type === "pathogenic") pathogenicCount++;
            else if (variants[next].type === "benign") benignCount++;
            next++;
        }
        const total = pathogenicCount + benignCount;
        const p = total === 0 ? 0 : pathogenicCount / total;
        pathogenicPct.push(p);
        benignPct.push(total === 0 ? 0 : 1 - p);
    }
    return { pathogenicPct, benignPct };
}

/** Smooths a series by averaging each point with its neighbours. */
export function movingAverage(values: number[], window = 5) {
    const half = Math.floor(window / 2);
    return values.map((_, i) => {
        const slice = values.slice(Math.max(0, i - half), Math.min(values.length, i + half + 1));
        return slice.reduce((a, b) => a + b, 0) / slice.length;
    });
}

/** Fraction of (benign, pathogenic) pairs where the pathogenic variant is ranked higher. */
export function topKAccuracyFromRanks(rows: MainTableRow[]): number {
    const ranked = rows.filter((r) => r.aggregateRank != null);
    const benign = ranked.filter((r) => compassCategory(r.regionID) === "benign");
    const pathogenic = ranked.filter((r) => compassCategory(r.regionID) === "pathogenic");
    if (benign.length === 0 || pathogenic.length === 0) return 0;

    let correct = 0;
    for (const b of benign) {
        for (const p of pathogenic) {
            if (b.aggregateRank > p.aggregateRank) correct++;
        }
    }
    return correct / (benign.length * pathogenic.length);
}
