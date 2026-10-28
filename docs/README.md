# ARGO developer docs

Docs for people working on the ARGO codebase. For setup, see the [project README](../README.md).

| Doc | Read it when you want to… |
| --- | --- |
| [Architecture](architecture.md) | Get the big picture: routes, folders, how data moves from upload to ranked table |
| [Uploads](uploads.md) | Change the input formats, validation rules, or how a submission reaches the results page |
| [Ranking](ranking.md) | Understand or change how each category ranks regions and how the aggregate rank is built |
| [Data and queries](data-and-queries.md) | Find which GraphQL query feeds which table, or add a new query |
| [Filters](filters.md) | Add or change a filter in the side drawer |
| [Compass Collections](compass.md) | Work on the Compass panel or add a reference variant set |
| [Common tasks](common-tasks.md) | Step-by-step recipes for frequent changes |

## Terms used throughout

- **Region** (or variant): one row of the user's upload. Type `InputRegion` in [src/types/regions.ts](../src/types/regions.ts). Identified by `regionID`.
- **cCRE**: a candidate cis-regulatory element from ENCODE SCREEN. Regions are intersected with cCREs to get element and gene data.
- **Category**: one of the three evidence groups (Sequence, Elements, Genes). Each ranks regions on its own.
- **Rows**: per-category data built from API results (`SequenceTableRow`, `ElementTableRow`, `GeneTableRow` in [src/types/rows.ts](../src/types/rows.ts)). Rows are what the detail tables show and what ranking reads.
- **Rank**: a region's position within a category (1 = best). `0` means unranked.
- **Aggregate rank**: the final rank, from the sum of the three category ranks.
