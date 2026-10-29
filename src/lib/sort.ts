/** Sorts numbers ascending with missing values (`isMissing`) always last. */
export const missingLastComparator =
    (isMissing: (v: unknown) => boolean) =>
    (a: unknown, b: unknown): number => {
        const aMissing = isMissing(a);
        const bMissing = isMissing(b);
        if (aMissing && !bMissing) return 1;
        if (!aMissing && bMissing) return -1;
        if (aMissing && bMissing) return 0;
        return Number(a) - Number(b);
    };
