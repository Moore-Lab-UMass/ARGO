import { MainTableRow } from "../../types";

export function cumulativeKDE(
    values: number[],
    xs: number[],
    bandwidth = 1
) {
    if (values.length === 0 || xs.length === 0) return [];

    const kernel = (u: number) =>
        Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);

    // Sort X values
    const sortedXs = [...xs].sort((a, b) => a - b);

    // Compute KDE values
    const densities = sortedXs.map(x =>
        values.reduce(
            (sum, v) => sum + kernel((x - v) / bandwidth),
            0
        ) / (values.length * bandwidth)
    );

    // Numerical integration (trapezoidal rule)
    const cdf: number[] = [];
    let cumulative = 0;

    for (let i = 0; i < densities.length; i++) {
        if (i > 0) {
            const dx = sortedXs[i] - sortedXs[i - 1];
            cumulative += densities[i] * dx;
        }
        cdf.push(cumulative);
    }

    // Normalize to [0, 1]
    const max = cdf[cdf.length - 1] || 1;
    return cdf.map(v => v / max);
}


export function topKAccuracyFromRanks(rows: MainTableRow[]): number {
    const benign = rows.filter(
        r => String(r.regionID).startsWith("Benign") && r.aggregateRank != null
    );

    const pathogenic = rows.filter(
        r => String(r.regionID).startsWith("Pathogenic") && r.aggregateRank != null
    );

    if (benign.length === 0 || pathogenic.length === 0) return 0;

    let correct = 0;
    let total = 0;

    for (const b of benign) {
        for (const p of pathogenic) {
            total++;
            if (b.aggregateRank! > p.aggregateRank!) {
                correct++;
            }
        }
    }

    return correct / total;
}

