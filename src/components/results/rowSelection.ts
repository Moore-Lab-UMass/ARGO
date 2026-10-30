import type { KeyboardEvent, MouseEvent } from "react";
import type { GridCellParams, GridRowParams } from "@mui/x-data-grid-premium";
import { RegionID } from "@/types/regions";

type RegionRow = { regionID: RegionID };

/** Links and buttons inside cells keep their own click behavior. */
const fromControl = (event: MouseEvent | KeyboardEvent) =>
    event.target instanceof Element && event.target.closest("a, button, input") !== null;

/**
 * Table props that call `onSelect` with a row's region when the row is clicked,
 * or when Enter / Space is pressed on one of its cells.
 */
export function regionSelectProps<R extends RegionRow>(onSelect: (regionID: RegionID) => void) {
    return {
        onRowClick: ({ row }: GridRowParams<R>, event: MouseEvent) => {
            if (!fromControl(event)) onSelect(row.regionID);
        },
        onCellKeyDown: ({ row }: GridCellParams<R>, event: KeyboardEvent) => {
            if ((event.key === "Enter" || event.key === " ") && !fromControl(event)) {
                event.preventDefault();
                onSelect(row.regionID);
            }
        },
    };
}
