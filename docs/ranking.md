# Ranking

All ranking code is in [src/lib/ranking/](../src/lib/ranking/). It's pure TypeScript with no React or network calls. The entry point is `rankRegions` in [pipeline.ts](../src/lib/ranking/pipeline.ts):

```ts
rankRegions(regions, rows, filters) → { ranks: { sequence, element, gene }, mainRows }
```

Each category turns its rows into a `RankedRegion[]`, then `computeMainRows` combines them.

## Shared helpers ([rank.ts](../src/lib/ranking/rank.ts))

- **`rankSorted(items, compare, value)`** sorts a copy and assigns ranks. Neighbours with the same `value` share a rank and the next rank skips ahead (standard competition ranking): values `9, 7, 7, 3` → ranks `1, 2, 2, 4`. Every ranking step uses this.
- **`indexBy`**: lookup map; the first item wins on duplicate keys.
- **`groupBy`**: groups items, keeping their order.
- **`coordKey`**: `"chr:start:end"`, for matching by coordinates.

## The pattern: sub-ranks summed, then ranked

Each category works the same way:

1. Rank all regions on each metric separately (sub-ranks).
2. Add up each region's sub-ranks.
3. Rank regions by that sum (lowest sum = rank 1).

The aggregate rank repeats this one level up, using the three category ranks as sub-ranks.

## Sequence ([sequence.ts](../src/lib/ranking/sequence.ts))

**Rows** (`buildSequenceRows`): one per region.

- **Conservation score**: per-base values from the selected bigWig track, reduced to one number by min, max or average (filter: *Rank conservation scores by*). Regions with no data get `-1,000,000` so they rank last.
- **Motifs**: from `MOTIF_RANKING_QUERY`, filtered by motif quality (A–D, the last part of the motif ID) and data source letters (4th part of the ID). The motif with the largest absolute ref/alt score difference is the region's *best motif*; its `|diff|` is the **motif score delta**. *Number of overlapping motifs* is the count of matching motifs.

**Ranking** (`rankSequence`): three sub-ranks, higher is better for each:

| Sub-rank | Value |
| --- | --- |
| Conservation | `conservationScore` |
| Motif score delta | `motifScoreDelta` |
| Overlapping motifs | `numOverlappingMotifs` |

If both conservation and motifs are turned off, every region gets rank 0. When one is off, its sub-rank ties for every region, so it has no effect.

> The conservation track's first data point is one base before the region. Some tracks return multi-base items, so `conservationScores` matches the real start and end back to the input coordinates on the same chromosome.

## Elements ([elements.ts](../src/lib/ranking/elements.ts))

**Rows** (`buildElementRows`): one per overlapping cCRE, not per region.

- Z-scores for DNase, ATAC, CTCF, H3K4me3 and H3K27ac. By default these are each cCRE's max z-score across all biosamples. With a biosample selected, that biosample's z-scores replace them.
- **mm10**: each human cCRE is swapped for its mouse ortholog; cCREs without one are dropped.
- **Must have ortholog** (GRCh38 only): drops cCREs without a mouse ortholog.
- cCREs whose class is turned off are dropped.

**Ranking** (`rankElements`):

1. `combineByRegion` collapses a region's cCREs into one row: each assay's value is the max or average (filter: *Rank cCREs with matching input region by*) over the cCREs that have a score for it.
2. `rankByAssays` ranks regions on each **enabled** assay, highest z-score first. Regions with no score for that assay are ranked last (`count with score + 1`).
3. Assay ranks are summed and ranked. Regions with no score for any enabled assay get rank 0.

## Genes ([genes.ts](../src/lib/ranking/genes.ts))

**Linked genes** (`buildLinkedGenes`): which genes each cCRE links to, depending on the linking method:

| Method | Source | Notes |
| --- | --- | --- |
| Distance | `CLOSEST_QUERY` | Closest gene; *protein coding only* switches between `PC` and `ALL` |
| Hi-C, ChIA-PET, CRISPRi-FlowFISH, eQTLs | `LINKED_GENES_QUERY` | CRISPRi-FlowFISH links count only with `p < 0.05` |
| ABC, rE2G, EPIraction, GraphRegLR | `COMPUTATIONAL_LNKED_GENES_QUERY` | Matched to cCREs by coordinates |

With *must have ortholog*, genes without a mouse ortholog are dropped (`filterOrthologGenes`).

**Rows** (`buildGeneRows`): one per region that has at least one linked gene. Genes from **all** of the region's cCREs are pooled, each gene counted once. From the genes linked by the selected method:

- **Expression specificity**: max or average (filter: *Rank expression specificity by*)
- **Gene expression** (TPM): max or average (filter: *Rank gene expression by*), optionally for a selected biosample

For max, the row also records which gene gave the score. For average, the gene name is `"Average"`.

**Ranking** (`rankGenes`): three sub-ranks:

| Sub-rank | Order |
| --- | --- |
| Expression specificity | Highest first |
| Gene expression | Highest first |
| Number of linked genes | Most or least first (filter: *Rank # of linked genes by*) |

Regions with no linked genes have no gene row, so they have no gene rank.

## Aggregate ([aggregate.ts](../src/lib/ranking/aggregate.ts))

`computeMainRows` sums each region's three category ranks and ranks regions by the sum (ties share a rank).

- A **missing or 0** category rank counts as `1,000,000`, so it pushes the region below every region that has that rank.
- A category that's turned off gives every region rank 0, which adds the same `1,000,000` to everyone and so doesn't change the order.

The result is sorted by aggregate rank and shown in the main table.

## Known issues

These are behaviours in the current code that may not be intended. Check with the team before relying on or changing them.

- **Motif score delta is always ranked.** `rankSequence` always includes the motif score delta sub-rank. The *Motif Score Delta* checkbox under "Include in ranking" only shows or hides the table column.
- **Regions without motifs sort unpredictably on motif delta.** Their `motifScoreDelta` is `undefined`, so the sort comparator returns `NaN` and their order against regions that do have motifs isn't defined. Giving them an explicit last-place value (as conservation does) would fix it.
- **Motif catalog and TF peak options don't affect results.** `motifCatalog`, `overlapsTFPeak` and `tfPeakStrength` are in filter state, but no query or ranking code reads them. Only HOCOMOCO is offered in the UI.
- **Genes linked by another method** get `linkedBy: []` in `parseLinkedGenes` (marked with a `NOTE` in the code), so they're left out of expression and specificity scores but still count toward the number of linked genes.
