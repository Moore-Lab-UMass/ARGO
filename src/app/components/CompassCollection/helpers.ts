export function kde(values: number[], xs: number[], bandwidth = 1) {
  const kernel = (u: number) =>
    Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);

  return xs.map(x =>
    values.reduce(
      (sum, v) => sum + kernel((x - v) / bandwidth),
      0
    ) / (values.length * bandwidth)
  );
}
