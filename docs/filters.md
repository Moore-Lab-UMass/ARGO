# Filters

The filter drawer on the results page controls which data is fetched and how each category ranks. State lives in [src/state/filters.tsx](../src/state/filters.tsx); types are in [src/types/filters.ts](../src/types/filters.ts).

## State shape

```ts
FilterState = {
  sequence: SequenceFilterState,  // conservation + motifs
  element:  ElementFilterState,   // cCRE z-scores
  gene:     GeneFilterState,      // linked genes
}
```

Defaults are in `initialFilters`. All three categories start on, with the 241-mammal phyloP track, all assays, all cCRE classes, and Distance as the linking method.

## Reading and changing filters

```tsx
const filters = useFilters();                          // current state
const { setSequence, setElement, setGene, dispatch, reset } = useFilterActions();

setElement("rankBy", "max");                           // simple field change
dispatch({ type: "selectElementBiosample", biosample }); // change with side effects
```

Both hooks must be used inside `<FiltersProvider>`, which wraps the results page. The state and dispatch are in separate contexts, so components that only change filters don't re-render when filters change.

### Actions with side effects

Use these instead of `set` when one change has to update other fields:

| Action | What else it does |
| --- | --- |
| `setMotifCatalog` | Clears the TF peak options |
| `setElementAssembly` | Clears the selected biosample and re-enables all assays (biosamples are per assembly) |
| `selectElementBiosample` | Limits available and selected assays to the ones that biosample has data for |
| `setLinkage` | Sets the linking method and biosample; optionally reuses it for gene expression if it has RNA-seq |
| `clearLinkage` | Back to Distance with no biosample |

## UI

| Section | Component |
| --- | --- |
| Drawer | [FiltersDrawer.tsx](../src/components/filters/FiltersDrawer.tsx) |
| Sequence | [SequenceFilters.tsx](../src/components/filters/SequenceFilters.tsx) |
| Elements | [ElementFilters.tsx](../src/components/filters/ElementFilters.tsx), [BiosampleModal.tsx](../src/components/filters/BiosampleModal.tsx) |
| Genes | [GeneFilters.tsx](../src/components/filters/GeneFilters.tsx), [LinkageBiosampleModal.tsx](../src/components/filters/LinkageBiosampleModal.tsx) |

Option lists come from [lib/constants.ts](../src/lib/constants.ts): `CONSERVATION_TRACKS`, `LINKAGE_METHOD_OPTIONS`, `ASSAYS`.

## What each filter affects

Filters that change a query's variables trigger a refetch (or a cache hit). The rest only change how existing data is ranked, which is instant.

| Filter | Refetches | Re-ranks only |
| --- | --- | --- |
| Category on/off | ✓ (skips or runs its queries) | |
| Conservation track | ✓ | |
| Conservation min/max/avg | | ✓ |
| Motif quality, data source | | ✓ |
| Element assembly, biosample, must have ortholog | ✓ | |
| Assays, cCRE classes, element rank by | | ✓ |
| Linking method, linkage biosample, protein coding, gene must have ortholog | ✓ | |
| Gene expression biosample, gene expression max/avg | ✓ | |
| Specificity max/avg, linked genes most/least | | ✓ |

See [Ranking → Known issues](ranking.md#known-issues) for filters that are in the UI but don't affect ranking.
