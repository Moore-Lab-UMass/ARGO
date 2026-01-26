import { useMemo } from "react";
import { generateGeneRanks } from "../submitted/[submitted]/tables/genes/geneHelpers";
import { ElementFilterState, ElementTableRow, GeneFilterState, GeneTableRow, InputRegions, MainTableRow, RankedRegions, SequenceFilterState, SequenceTableRow } from "../types";
import { generateElementRanks, handleSameInputRegion } from "../submitted/[submitted]/tables/elements/elementHelpers";
import { generateSequenceRanks } from "../submitted/[submitted]/tables/sequence/sequenceHelpers";
import { calculateAggregateRanks, matchRanks } from "../submitted/[submitted]/tables/main/helpers";

interface UseCompassMainRowsParams {
  regions: InputRegions;
  sequenceRows: SequenceTableRow[] | null;
  elementRows: ElementTableRow[] | null;
  geneRows: GeneTableRow[] | null;
  sequenceFilterVariables: SequenceFilterState;
  elementFilterVariables: ElementFilterState;
  geneFilterVariables: GeneFilterState;
  loadingScores: boolean;
}

interface UseCompassMainRowsResult {
  mainRows: MainTableRow[];
  loading: boolean;
}

export function useCompassMainRows({
  regions,
  sequenceRows,
  elementRows,
  geneRows,
  sequenceFilterVariables,
  elementFilterVariables,
  geneFilterVariables,
  loadingScores
}: UseCompassMainRowsParams): UseCompassMainRowsResult {

  // ---- Sequence ranks ----
  const sequenceRanks = useMemo<RankedRegions>(() => {
    if (
      sequenceRows === null ||
      (!sequenceFilterVariables.useConservation &&
        !sequenceFilterVariables.useMotifs)
    ) {
      return regions.map(r => ({
        chr: r.chr,
        start: r.start,
        end: r.end,
        rank: 0,
      }));
    }

    if (sequenceRows.length === 0) return [];

    return generateSequenceRanks(sequenceRows);
  }, [
    regions,
    sequenceRows,
    sequenceFilterVariables.useConservation,
    sequenceFilterVariables.useMotifs,
  ]);

  // ---- Element ranks ----
  const elementRanks = useMemo<RankedRegions>(() => {
    if (elementRows === null || !elementFilterVariables.usecCREs) {
      return regions.map(r => ({
        chr: r.chr,
        start: r.start,
        end: r.end,
        rank: 0,
      }));
    }

    if (elementRows.length === 0) return [];

    const processedRows = handleSameInputRegion(
      elementFilterVariables.rankBy,
      elementRows
    );

    return generateElementRanks(
      processedRows,
      elementFilterVariables.classes,
      elementFilterVariables.assays
    );
  }, [
    regions,
    elementRows,
    elementFilterVariables.usecCREs,
    elementFilterVariables.rankBy,
    elementFilterVariables.classes,
    elementFilterVariables.assays,
  ]);

  // ---- Gene ranks ----
  const geneRanks = useMemo<RankedRegions>(() => {
    if (geneRows === null || !geneFilterVariables.useGenes) {
      return regions.map(r => ({
        chr: r.chr,
        start: r.start,
        end: r.end,
        rank: 0,
      }));
    }

    if (geneRows.length === 0) return [];

    return generateGeneRanks(
      geneRows,
      geneFilterVariables.rankLinkedBy
    );
  }, [
    regions,
    geneRows,
    geneFilterVariables.useGenes,
    geneFilterVariables.rankLinkedBy,
  ]);

  // ---- Main rows (aggregate + sort) ----
  const mainRows = useMemo<MainTableRow[]>(() => {
    if (
      regions.length === 0 ||
      (sequenceRanks.length === 0 &&
        elementRanks.length === 0 &&
        geneRanks.length === 0)
    ) {
      return [];
    }

    const aggregateRanks = calculateAggregateRanks(
      regions,
      sequenceRanks,
      elementRanks,
      geneRanks
    );

    const updatedMainRows = matchRanks(
      regions,
      sequenceRanks,
      elementRanks,
      geneRanks,
      aggregateRanks
    );

    return updatedMainRows.sort(
      (a, b) => a.aggregateRank - b.aggregateRank
    );
  }, [regions, sequenceRanks, elementRanks, geneRanks]);

  // ---- Loading ----
  const loading =
    (loadingScores &&
      (sequenceFilterVariables.useConservation ||
        sequenceFilterVariables.useMotifs)) ||
    (loadingScores && elementFilterVariables.usecCREs) ||
    (loadingScores && geneFilterVariables.useGenes);

  return {
    mainRows,
    loading,
  };
}
