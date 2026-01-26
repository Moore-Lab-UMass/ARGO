import { useMemo } from "react";
import { useSequenceData } from "./useSequenceData";
import { filterSequence } from "../submitted/[submitted]/tables/sequence/sequenceHelpers";
import { useElementData } from "./useElementData";
import { buildOrthologMap, filterElements, mapScores, mapScoresCTSpecific } from "../submitted/[submitted]/tables/elements/elementHelpers";
import { useLinkedGenes } from "./useLinkedGenes";
import { computationalMethods, filterGenes, getExpressionScores, getSpecificityScores } from "../submitted/[submitted]/tables/genes/geneHelpers";
import { CCREs, ComputationalMethod, ElementFilterState, GeneFilterState, GeneTableRow, InputRegions, SequenceFilterState } from "../types";
import { useGeneScores } from "./useGeneScores";
import { useLazyQuery } from "@apollo/client";
import { GENE_ORTHO_QUERY } from "../queries";

export interface UseCompassScoresProps {
  regions: InputRegions;
  intersectingCcres: CCREs;
  sequenceFilterVariables: SequenceFilterState;
  elementFilterVariables: ElementFilterState;
  geneFilterVariables: GeneFilterState;
}


export function useCompassScores({
  regions,
  intersectingCcres,
  sequenceFilterVariables,
  elementFilterVariables,
  geneFilterVariables,
}: UseCompassScoresProps) {
    const [getOrthoGenes, { data: orthoGenes }] = useLazyQuery(GENE_ORTHO_QUERY)

  //sequence data
  const {
    conservation,
    motifs,
    loading: loadingSequence,
    error: errorSequence,
  } = useSequenceData({
    inputRegions: regions,
    sequenceFilterVariables,
  });

  const sequenceRows = useMemo(() => {
    if (errorSequence) return null;
    if ((!conservation.data && !motifs.data) || regions.length === 0 || loadingSequence)
      return [];

    return filterSequence({
      inputRegions: regions,
      conservationData: conservation.data,
      motifData: motifs.data,
      sequenceFilterVariables,
    });
  }, [errorSequence, conservation.data, motifs.data, regions, loadingSequence, sequenceFilterVariables]);

  //element data
  const {
    ortho,
    zScores,
    loading: loadingElements,
    error: errorElements,
  } = useElementData({
    intersectingCcres,
    elementFilterVariables,
  });

  const allElementData = useMemo(() => {
    if (!zScores.data) return [];

    const data = zScores.data.cCRESCREENSearch;
    const orthoMap = buildOrthologMap(ortho.data);

    const baseCcres =
      elementFilterVariables.cCREAssembly === "mm10"
        ? intersectingCcres
            .map(ccre => ({
              ...ccre,
              accession: orthoMap[ccre.accession],
            }))
            .filter(ccre => ccre.accession)
        : intersectingCcres;

    const scoreMapper = elementFilterVariables.selectedBiosample
      ? mapScoresCTSpecific
      : mapScores;

    return baseCcres.map(ccre => scoreMapper(ccre, data));
  }, [
    zScores.data,
    intersectingCcres,
    elementFilterVariables.cCREAssembly,
    elementFilterVariables.selectedBiosample,
    ortho.data,
  ]);

  const elementRows = useMemo(() => {
    if (loadingElements || errorElements || allElementData.length === 0) {
      return [];
    }

    return filterElements({
      allElementData,
      orthoData: ortho.data,
      elementFilterVariables,
    });
  }, [loadingElements, errorElements, allElementData, ortho.data, elementFilterVariables]);

  //gene data
  const {
    closest,
    linked,
    computational,
    loading: loadingGenes,
    error: errorGenes,
  } = useLinkedGenes({
    intersectingCcres,
    geneFilterVariables,
  });

  const filteredGenes = useMemo(() => {
      if (!intersectingCcres ||
          (geneFilterVariables.methodOfLinkage === "distance" && !closest.data) ||
          (geneFilterVariables.methodOfLinkage !== "distance" && !computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !linked.data) ||
          (computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !computational.data)) {
          return [];
      }

    return filterGenes({
      closestData: closest.data,
      linkedData: linked.data,
      computationalData: computational.data,
      intersectingCcres,
      geneFilterVariables,
      orthoGenes,
      getOrthoGenes
    });
  }, [closest.data, computational.data, geneFilterVariables, getOrthoGenes, intersectingCcres, linked.data, orthoGenes]);

  const {
    specificity,
    expression,
    loading: loadingGeneScores,
  } = useGeneScores({
    filteredGenes,
    geneFilterVariables,
  });

  const geneRows = useMemo(() => {
    if (!filteredGenes || filteredGenes.length === 0) return [];
    if (!specificity.data || !expression.data) return [];

    const specificityRows = getSpecificityScores(filteredGenes, intersectingCcres, specificity.data, geneFilterVariables);
    const expressionRows = getExpressionScores(filteredGenes, intersectingCcres, expression.data, geneFilterVariables);

    const mergedRowsMap = new Map<string | number, GeneTableRow>();

    specificityRows.forEach(row => mergedRowsMap.set(row.regionID, row));

    expressionRows.forEach(row => {
      const existing = mergedRowsMap.get(row.regionID);
      mergedRowsMap.set(row.regionID, {
        ...(existing ?? {}),
        ...row,
      });
    });

    return Array.from(mergedRowsMap.values());
  }, [filteredGenes, specificity.data, expression.data, intersectingCcres, geneFilterVariables]);

  const loading = loadingSequence || loadingElements || loadingGenes || loadingGeneScores;
  const error = errorSequence || errorElements || errorGenes || expression.error;

  return {
    sequenceRows,
    elementRows,
    geneRows,
    loading,
    error,
  };
}
