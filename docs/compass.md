# Compass Collections

Compass shows where the user's variants land compared with known pathogenic and benign variants. It's the floating button in the bottom-right of the results page.

Code: [src/components/compass/](../src/components/compass/).

## How it works

1. [CompassCollection.tsx](../src/components/compass/CompassCollection.tsx) renders the button. The panel is loaded lazily (`next/dynamic`) the first time it's opened.
2. [CompassPanel.tsx](../src/components/compass/CompassPanel.tsx) loads the selected collection's VCF with `useCompassRegions`, then fetches its rows with `useCategoryRows`, using the same filters as the page.
3. The user's regions and the collection's variants are ranked **together** with `rankRegions` (rows combined with `concatRows`). So Compass ranks can differ from the main table: the user's regions are competing with more variants.
4. [CompassChart.tsx](../src/components/compass/CompassChart.tsx) plots, for each rank, the share of pathogenic vs benign variants ranked at or above it (smoothed with a moving average). [RankBand.tsx](../src/components/compass/RankBand.tsx) marks where the user's regions fall.

`topKAccuracyFromRanks` in [helpers.ts](../src/components/compass/helpers.ts) gives the fraction of (benign, pathogenic) pairs where the pathogenic variant ranks higher.

## Collection files

Collections are VCF-like TSVs in `/public`, listed in `COMPASS_COLLECTIONS` in [lib/constants.ts](../src/lib/constants.ts).

```
#CHROM	POS	REF	ALT	ID	CLNSIG_category
chr1	228150008	G	C	2202995	Pathogenic
chr2	86214211	C	CTGTT	337345	Benign
```

`parseCompassVcf` in [lib/regions/parse.ts](../src/lib/regions/parse.ts) turns each line into a region:

- `start = POS - 1` (converted to 0-based)
- `end = start + len(REF)` for substitutions and deletions, `start + 1` for insertions
- `regionID = "<category>_<ID>"`, e.g. `Pathogenic_2202995`

The `Pathogenic_` / `Benign_` prefix is how `compassCategory` tells variants apart, so the category column must be exactly `Pathogenic` or `Benign`. Any other region ID is treated as the user's input.

To add a collection, see [Common tasks](common-tasks.md#add-a-compass-collection).
