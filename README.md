# ARGO: Aggregate Rank Generator

ARGO takes a list of genomic variants and ranks them by combining evidence from three categories:

- **Sequence:** conservation scores and TF motif changes between reference and alternate alleles
- **Elements:** z-scores of the cCREs (candidate cis-regulatory elements) each variant overlaps
- **Genes:** expression, specificity and number of genes linked to those cCREs

Each category ranks the variants on its own. The ranks are summed into one **aggregate rank**. Filters in the side drawer control which data is used and how each category ranks.

## Getting started

```bash
yarn install
yarn dev        # http://localhost:3000
```

`.env.local` needs `SCREEN_API_KEY` (GraphQL API) and `NEXT_PUBLIC_MUI_X_LICENSE_KEY`.
After editing a query in `src/lib/graphql/queries.ts`, run `yarn gen-types` to regenerate `src/graphql/__generated__`.

## Developer docs

See [docs/](docs/README.md) for architecture, the ranking algorithm, queries, filters, Compass, and how-tos for common changes.

## How the code is organized

```
src/
  app/                 Next.js routes only (home, results, about, help, /api/graphql proxy)
  components/
    landing/           Upload forms on the home page
    filters/           Filter drawer and its Sequence / Elements / Genes sections
    results/           Ranked regions table and the three detail tables
    compass/           Compass Collection panel (ranks your variants against known ones)
    layout/            Header, footer, links
    providers/         Apollo and MUI X license setup
  hooks/               Data fetching: one hook per category, plus useCategoryRows to run all three
  lib/
    ranking/           Pure ranking logic (no React): build rows, rank each category, aggregate
    regions/           Parsing uploads, validation, saving the submission, cCRE intersect
    graphql/           GraphQL queries
    constants.ts       Linking methods, conservation tracks, compass collections
    colors.ts          Shared colors and category color maps
  state/filters.tsx    Filter state (React context + reducer)
  types/               Shared types: regions, filters, table rows
```

### Data flow on the results page

```
upload  ──saveSubmission──▶ sessionStorage ──loadSubmission──▶ regions
regions ──useCategoryRows(regions, filters)──▶ { sequence, element, gene } rows
rows    ──rankRegions(regions, rows, filters)──▶ per-category ranks + aggregate ranked rows
```

- `useCategoryRows` (in `src/hooks`) finds the cCREs overlapping the regions and runs `useSequenceRows`, `useElementRows` and `useGeneRows`. Each hook runs its GraphQL queries and turns the results into table rows with the `build*Rows` functions in `lib/ranking`.
- `rankRegions` (in `lib/ranking/pipeline.ts`) is a pure function. It is the only place ranks are computed.
- `ResultsTables` calls both once and passes rows down. The tables only display what they receive.
- Compass uses the same two steps for its reference variants, combined with your rows, and only once its panel is opened.
- Filters live in `state/filters.tsx`. Read them with `useFilters()` and change them with `useFilterActions()`.
