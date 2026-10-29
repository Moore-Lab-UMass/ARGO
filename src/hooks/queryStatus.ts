/** True while any of the queries is loading. */
export const anyLoading = (queries: { loading: boolean }[]) => queries.some((q) => q.loading);

/** The first error among the queries, in order. */
export function firstError<E>(queries: { error?: E }[]): E | undefined {
    return queries.find((q) => q.error)?.error;
}
