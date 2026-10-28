# Common tasks

## Add a conservation track

1. Add the alignment name to the `Alignment` type in [src/types/filters.ts](../src/types/filters.ts).
2. Add an entry to `CONSERVATION_TRACKS` in [src/lib/constants.ts](../src/lib/constants.ts) with the bigWig `url`, `menuLabel` (dropdown) and `columnLabel` (table header). Set `hidden: true` to keep it out of the dropdown.

The dropdown and table column read from `CONSERVATION_TRACKS`, so nothing else needs changing.

## Add a gene linking method

1. Add it to `GeneLinkingMethod` (or `ComputationalMethod` for a model-based method) in [src/types/filters.ts](../src/types/filters.ts).
2. Add it to `LINKAGE_METHOD_OPTIONS` in [src/lib/constants.ts](../src/lib/constants.ts), and to `COMPUTATIONAL_METHODS` if computational.
3. Check `buildLinkedGenes` in [src/lib/ranking/genes.ts](../src/lib/ranking/genes.ts) and the query variables in [useGeneRows.ts](../src/hooks/useGeneRows.ts). The method name must match what the API returns once `-` is replaced by `_`.

## Add a Compass collection

1. Put the VCF in `/public` with the columns `CHROM POS REF ALT ID CLNSIG_category` (category `Pathogenic` or `Benign`). See [Compass](compass.md#collection-files).
2. Add it to `COMPASS_COLLECTIONS` in [src/lib/constants.ts](../src/lib/constants.ts) with its file path and variant count.

## Add a filter

1. Add the field to the right section type in [src/types/filters.ts](../src/types/filters.ts) and a default in `initialFilters` in [src/state/filters.tsx](../src/state/filters.tsx).
2. Add the control to the section's filter component and change it with `setSequence` / `setElement` / `setGene`. If it has to update other fields, add a reducer action instead.
3. Use it:
   - If it changes **what data is fetched**, add it to the query variables (and the `useMemo` deps) in the category's hook.
   - If it changes **how regions are ranked**, read it in the category's `build*Rows` or `rank*` function in [src/lib/ranking/](../src/lib/ranking/).

## Add or change a GraphQL query

1. Edit [src/lib/graphql/queries.ts](../src/lib/graphql/queries.ts), wrapping the query in `gql()`.
2. Run `yarn gen-types` (needs `SCREEN_API_KEY`).
3. Use the generated result type (e.g. `GetcCreDetailsQuery`) in the hook or ranking code.

## Change how a category ranks

Edit the `rank*` function for that category in [src/lib/ranking/](../src/lib/ranking/). Use `rankSorted` so ties keep sharing ranks, and decide where regions without a value should go: last, or unranked (rank 0). [Ranking](ranking.md) describes the current rules.

## Change upload validation

Edit `validateRegions` in [src/lib/regions/validate.ts](../src/lib/regions/validate.ts). If the error should highlight a column in the "Required fields" dialog, return a `field` and make sure it matches one in `REQUIRED_FIELDS` in [ArgoUpload.tsx](../src/components/landing/ArgoUpload.tsx).

## Before opening a PR

```bash
yarn lint
yarn build
```

There's no automated test suite yet. Try the change on the results page with one of the example files in `/public`.
