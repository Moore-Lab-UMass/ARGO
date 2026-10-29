"use client";
import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { GridSortModel } from "@mui/x-data-grid-premium";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { BRAND, RankCategory } from "@/lib/colors";
import { useFilters } from "@/state/filters";
import { RegionID } from "@/types/regions";
import { MainTableRow } from "@/types/rows";
import { missingLastComparator } from "@/lib/sort";
import { Mono, RankBadge, RankPill } from "./cells";
import { cardSx, tableSx, toolbarStyle } from "./tableStyles";

const AGGREGATE_SORT: GridSortModel = [{ field: "aggregateRank", sort: "asc" }];

/** Category ranks of 0 mean "not ranked" and always sort last. */
const naLast = missingLastComparator((v) => v === "N/A" || v === 0);

type MainTableProps = {
    rows: MainTableRow[];
    loading: boolean;
    /** The selected region: its rows are isolated in the detail tables and shown in the inspector */
    selected: RegionID | null;
    onSelect: (regionID: RegionID | null) => void;
};

/** The ranked regions table. Clicking a row selects it; clicking it again clears the selection. */
export default function MainTable({ rows, loading, selected, onSelect }: MainTableProps) {
    const { sequence, element, gene } = useFilters();
    const useSequence = sequence.useConservation || sequence.useMotifs;

    const columns = useMemo(() => {
        const cols: TableColDef<MainTableRow>[] = [
            {
                field: "aggregateRank",
                headerName: "Aggregate",
                renderCell: ({ row }) => <RankBadge rank={row.aggregateRank} />,
            },
            { field: "regionID", headerName: "Region ID" },
            {
                field: "inputRegion",
                headerName: "Input Region",
                valueGetter: (_, row) => `${row.inputRegion.chr}: ${row.inputRegion.start}-${row.inputRegion.end}`,
                renderCell: ({ value }) => <Mono color={BRAND.muted}>{value}</Mono>,
            },
            {
                field: "change",
                headerName: "Change",
                valueGetter: (_, row) => (row.ref || row.alt ? `${row.ref ?? "?"} → ${row.alt ?? "?"}` : ""),
                renderCell: ({ value }) => <Mono>{value}</Mono>,
            },
        ];
        const category = (field: "sequenceRank" | "elementRank" | "geneRank", headerName: string, cat: RankCategory): TableColDef<MainTableRow> => ({
            field,
            headerName,
            sortComparator: naLast,
            renderCell: ({ row }) => <RankPill rank={row[field]} category={cat} />,
        });
        if (useSequence) cols.push(category("sequenceRank", "Sequence", "sequence"));
        if (element.usecCREs) cols.push(category("elementRank", "Element", "element"));
        if (gene.useGenes) cols.push(category("geneRank", "Gene", "gene"));
        return cols;
    }, [useSequence, element.usecCREs, gene.useGenes]);

    const toggle = (id: RegionID) => onSelect(id === selected ? null : id);

    return (
        <Box sx={cardSx}>
            <Table
                columns={columns}
                rows={rows}
                loading={loading}
                initialState={{ sorting: { sortModel: AGGREGATE_SORT } }}
                divHeight={{ height: "440px", maxHeight: "440px" }}
                slotProps={{ toolbar: { style: toolbarStyle } }}
                label={
                    <Stack direction="row" alignItems="baseline" gap={1.5} flexWrap="wrap">
                        <Typography component="h2" sx={{ fontSize: 15, fontWeight: 600 }}>
                            Ranked regions
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: BRAND.muted }}>Click a row to inspect it</Typography>
                    </Stack>
                }
                getRowId={(row) => row.regionID}
                onRowClick={({ id }) => toggle(id as RegionID)}
                onCellKeyDown={({ id }, event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        toggle(id as RegionID);
                    }
                }}
                getRowClassName={({ id }) => (id === selected ? "selected-region" : "")}
                sx={{
                    ...tableSx,
                    "& .MuiDataGrid-row": { cursor: "pointer" },
                    "& .MuiDataGrid-row.selected-region, & .MuiDataGrid-row.selected-region:hover": {
                        backgroundColor: BRAND.selectedRow,
                    },
                    "& .selected-region .rank-badge": { backgroundColor: BRAND.navy, color: "#ffffff" },
                }}
            />
        </Box>
    );
}
