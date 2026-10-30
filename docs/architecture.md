# Architecture

ARGO is a client-side Next.js 15 (App Router) app. All ranking runs in the browser. The only server code is a small proxy that forwards GraphQL requests to the SCREEN API with the API key attached.

**Stack:** Next.js 15, React 19, MUI 7 + MUI X (Data Grid Premium, Charts), Apollo Client 4, GraphQL Codegen, Yarn 4.

## Routes

| Route | File | What it does |
| --- | --- | --- |
| `/` | [src/app/page.tsx](../src/app/page.tsx) | Upload forms: ARGO format or rsID list |
| `/submitted/[name]` | [src/app/submitted/[submitted]/page.tsx](../src/app/submitted/[submitted]/page.tsx) | Results: filter sidebar, ranked table, detail tables (tabs or all three), selected-region panel, Compass |
| `/about`, `/help` | [src/app/about/](../src/app/about/), [src/app/help/](../src/app/help/) | Static pages; Help has the contact form (EmailJS) |
| `POST /api/graphql` | [src/app/api/graphql/route.ts](../src/app/api/graphql/route.ts) | Proxy to `API.CcreAPI` in [config.json](../src/app/config.json), adds `SCREEN_API_KEY` |

The `[name]` part of the results URL is only the file name for display. The regions themselves come from `sessionStorage` (see [Uploads](uploads.md)), so a results URL can't be shared or bookmarked.

## Folder layout

```
src/
  app/          Routes only. Keep logic out of here.
  components/   React UI, grouped by area (landing, filters, results, compass, layout, providers)
  hooks/        Data fetching. One hook per category, plus useCategoryRows to run all three
  lib/
    ranking/    Pure functions, no React: build rows from API data, rank, aggregate
    regions/    Parse uploads, validate, save/load the submission, cCRE intersect
    graphql/    All GraphQL queries (queries.ts)
    constants.ts, colors.ts, downloads.ts, format.ts, sort.ts
  state/        Filter state: filterReducer.ts (initial state + reducer), filters.tsx (provider + hooks)
  types/        Shared types: regions, filters, rows
  graphql/__generated__/   Codegen output. Don't edit by hand.
```

The split to keep in mind: **hooks fetch, `lib/ranking` computes.** Ranking functions take plain data and return plain data, so they can be reasoned about (and tested) without React or the network.

## Data flow on the results page

```
sessionStorage ──loadSubmission──▶ regions (InputRegion[])
                                       │
            useCategoryRows(regions, filters)
            ├─ useIntersectingCcres  → cCREs overlapping each region
            ├─ useSequenceRows       → conservation + motif rows      (uses regions)
            ├─ useElementRows        → cCRE z-score rows              (uses cCREs)
            └─ useGeneRows           → linked gene rows               (uses cCREs)
                                       │
                                       ▼
            rankRegions(regions, rows, filters)
            ├─ rankSequence / rankElements / rankGenes → per-category ranks
            └─ computeMainRows                         → aggregate-ranked main table rows
```

[ResultsTables.tsx](../src/components/results/ResultsTables.tsx) calls `useCategoryRows` once for the page and passes the rows down to the main table, the three detail tables, the selected-region panel ([RegionInspector.tsx](../src/components/results/RegionInspector.tsx)), and Compass. Clicking a row in the main table selects that one region: the detail tables isolate its rows and the panel opens. The Compass panel calls `useCategoryRows` a second time for its reference variants and ranks both sets together.

Every hook skips its queries when its category is turned off in the filters. Rows are only built once all of a category's queries have finished, so a table shows either complete data or nothing.

## API access

- **In the browser**, Apollo sends requests to `/api/graphql` (the proxy), so the API key never reaches the client.
- **On the server**, Apollo calls the SCREEN API directly with the key.

Both are set up in [ApolloProvider.tsx](../src/components/providers/ApolloProvider.tsx). Apollo's `InMemoryCache` caches query results, so switching a filter back to an earlier value is usually instant.

## Environment

`.env.local`:

| Variable | Used by |
| --- | --- |
| `SCREEN_API_KEY` | GraphQL proxy and codegen (server only) |
| `NEXT_PUBLIC_MUI_X_LICENSE_KEY` | MUI X Premium license ([MuiXLicense.tsx](../src/components/providers/MuiXLicense.tsx)) |

Most of [config.json](../src/app/config.json) is left over from SCREEN. ARGO only reads `API.CcreAPI`.
