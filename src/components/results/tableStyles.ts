import { RADIUS } from "@/app/theme";
import { BRAND } from "@/lib/colors";

/** Card that holds a results table. */
export const cardSx = {
    backgroundColor: BRAND.paper,
    border: `1px solid ${BRAND.border}`,
    borderRadius: `${RADIUS}px`,
    boxShadow: "0 1px 3px rgba(16,24,40,0.06)",
    overflow: "hidden",
} as const;

/** Data grid styling shared by every results table (pass as `sx` to the Weng Lab Table). */
export const tableSx = {
    border: "none",
    borderRadius: 0,
    fontSize: 13,
    // Header cells plus the header's filler to the right of the last column (not the filler below the rows)
    "& .MuiDataGrid-columnHeader, & .MuiDataGrid-columnHeaderRow .MuiDataGrid-filler": { backgroundColor: BRAND.subtle },
    "& .MuiDataGrid-columnHeaderTitle": { fontWeight: 600, color: BRAND.muted },
    "& .MuiDataGrid-cell": { borderColor: BRAND.divider },
    // Clicking a row selects its region
    "& .MuiDataGrid-row": { cursor: "pointer" },
} as const;

/** Toolbar props shared by every results table. */
export const toolbarStyle = { backgroundColor: BRAND.paper, borderBottom: `1px solid ${BRAND.divider}` };
