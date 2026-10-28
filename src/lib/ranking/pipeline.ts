import { FilterState } from "@/types/filters";
import { InputRegion } from "@/types/regions";
import { ElementTableRow, GeneTableRow, MainTableRow, SequenceTableRow } from "@/types/rows";
import { CategoryRanks, computeMainRows } from "./aggregate";
import { rankElements } from "./elements";
import { rankGenes } from "./genes";
import { rankSequence } from "./sequence";

export type CategoryRows = {
    sequence: SequenceTableRow[];
    element: ElementTableRow[];
    gene: GeneTableRow[];
};

/** Ranks every region within each category, then combines those into the aggregate ranking. */
export function rankRegions(
    regions: InputRegion[],
    rows: CategoryRows,
    filters: FilterState
): { ranks: CategoryRanks; mainRows: MainTableRow[] } {
    const ranks: CategoryRanks = {
        sequence: rankSequence(rows.sequence, filters.sequence, regions),
        element: rankElements(rows.element, filters.element, regions),
        gene: rankGenes(rows.gene, filters.gene, regions),
    };
    return { ranks, mainRows: computeMainRows(regions, ranks) };
}

/** Row lists for two sets of regions, one after the other (used to rank compass variants alongside the user's). */
export const concatRows = (a: CategoryRows, b: CategoryRows): CategoryRows => ({
    sequence: [...a.sequence, ...b.sequence],
    element: [...a.element, ...b.element],
    gene: [...a.gene, ...b.gene],
});
