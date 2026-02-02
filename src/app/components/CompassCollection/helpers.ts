import { MainTableRow } from "../../types";

export function kdePDF(
  values: number[],
  xs: number[],
  bandwidth = 1.5
) {
  if (values.length === 0) return xs.map(() => 0);

  const kernel = (u: number) =>
    Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);

  const densities = xs.map(x =>
    values.reduce(
      (sum, v) => sum + kernel((x - v) / bandwidth),
      0
    ) / (values.length * bandwidth)
  );

  // --- Normalize so area = 1 ---
  let area = 0;
  for (let i = 1; i < xs.length; i++) {
    const dx = xs[i] - xs[i - 1];
    area += densities[i] * dx;
  }

  return densities.map(d => d / area);
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

