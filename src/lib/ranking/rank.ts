/**
 * Sorts a copy of `items` with `compare` and gives each item a rank.
 * Tied neighbours (same `value`) share a rank and the next rank skips ahead,
 * e.g. values 9, 7, 7, 3 get ranks 1, 2, 2, 4.
 *
 * Returns the items in sorted order.
 */
export function rankSorted<T>(
    items: readonly T[],
    compare: (a: T, b: T) => number,
    value: (item: T) => unknown
): { item: T; rank: number }[] {
    const sorted = [...items].sort(compare);
    let rank = 1;
    return sorted.map((item, index) => {
        if (index > 0 && value(item) !== value(sorted[index - 1])) {
            rank = index + 1;
        }
        return { item, rank };
    });
}

/** Builds a lookup from the items; when two items share a key the first one wins. */
export function indexBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T> {
    const map = new Map<K, T>();
    for (const item of items) {
        const k = key(item);
        if (!map.has(k)) map.set(k, item);
    }
    return map;
}

/** Groups items by key, keeping their original order within each group. */
export function groupBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const item of items) {
        const k = key(item);
        const group = map.get(k);
        if (group) group.push(item);
        else map.set(k, [item]);
    }
    return map;
}

/** Key for matching regions by coordinates. */
export const coordKey = <R extends { chr: string | number; start: number; end: number }>(r: R) => `${r.chr}:${r.start}:${r.end}`;
