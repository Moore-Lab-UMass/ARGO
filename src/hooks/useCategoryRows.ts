import { useMemo } from "react";
import { CategoryRows } from "@/lib/ranking/pipeline";
import { FilterState } from "@/types/filters";
import { InputRegion } from "@/types/regions";
import { useElementRows } from "./useElementRows";
import { useGeneRows } from "./useGeneRows";
import { useIntersectingCcres } from "./useIntersectingCcres";
import { useSequenceRows } from "./useSequenceRows";

type Options = {
    /** See useSequenceRows: keep partial sequence results when one query fails */
    keepPartialSequence?: boolean;
};

/**
 * Fetches and builds the sequence, element and gene rows for a set of regions.
 * The page and Compass both use this; ranking happens afterwards with `rankRegions`.
 */
export function useCategoryRows(regions: InputRegion[], filters: FilterState, { keepPartialSequence = false }: Options = {}) {
    const { ccres, loading: loadingCcres } = useIntersectingCcres(regions);
    const sequence = useSequenceRows(regions, filters.sequence, { keepPartial: keepPartialSequence });
    const element = useElementRows(ccres, filters.element);
    const gene = useGeneRows(ccres, filters.gene);

    const rows: CategoryRows = useMemo(
        () => ({ sequence: sequence.rows, element: element.rows, gene: gene.rows }),
        [sequence.rows, element.rows, gene.rows]
    );

    const loading = {
        sequence: sequence.loading,
        element: filters.element.usecCREs && (element.loading || loadingCcres),
        gene: filters.gene.useGenes && (gene.loading || loadingCcres),
    };

    return {
        rows,
        loading: { ...loading, any: loading.sequence || loading.element || loading.gene },
        errors: { sequence: sequence.error, element: element.error, gene: gene.error },
    };
}
