"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { GRID_CHECKBOX_SELECTION_COL_DEF, GridColumnHeaderParams, GridSortModel, useGridApiRef } from "@mui/x-data-grid-premium";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { useFilters } from "@/state/filters";
import { RegionID } from "@/types/regions";
import { MainTableRow } from "@/types/rows";
import AutoSortSwitch from "./AutoSortSwitch";
import { missingLastComparator } from "./cells";

const AGGREGATE_SORT: GridSortModel = [{ field: "aggregateRank", sort: "asc" }];
const SELECTED_FIRST_SORT: GridSortModel = [{ field: "__check__", sort: "desc" }];

/** Category ranks of 0 mean "not ranked" and always sort last. */
const naLast = missingLastComparator((v) => v === "N/A" || v === 0);
const rankOrNA = (rank?: number) => (rank === 0 ? "N/A" : rank);

/** Header checkbox that doesn't also trigger column sorting when clicked. */
const SelectAllHeader = (params: GridColumnHeaderParams) => (
    <div onClick={(e) => e.stopPropagation()}>
        <GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader {...params} />
    </div>
);

type MainTableProps = {
    rows: MainTableRow[];
    loading: boolean;
    selected: Set<RegionID>;
    onSelectedChange: (selected: Set<RegionID>) => void;
};

/** The ranked regions table; selecting rows isolates them in the detail tables below. */
export default function MainTable({ rows, loading, selected, onSelectedChange }: MainTableProps) {
    const { sequence, element, gene } = useFilters();
    const useSequence = sequence.useConservation || sequence.useMotifs;
    const [autoSort, setAutoSort] = useState(true);
    const apiRef = useGridApiRef();

    const columns = useMemo(() => {
        const cols: TableColDef<MainTableRow>[] = [
            {
                ...(GRID_CHECKBOX_SELECTION_COL_DEF as TableColDef<MainTableRow>),
                sortable: true,
                hideable: false,
                renderHeader: SelectAllHeader,
            },
            { field: "regionID", headerName: "Region ID" },
            {
                field: "inputRegion",
                headerName: "Input Region",
                valueGetter: (_, row) => `${row.inputRegion.chr}: ${row.inputRegion.start}-${row.inputRegion.end}`,
            },
            { field: "aggregateRank", headerName: "Aggregate" },
        ];
        const category = (field: "sequenceRank" | "elementRank" | "geneRank", headerName: string): TableColDef<MainTableRow> => ({
            field,
            headerName,
            sortComparator: naLast,
            renderCell: ({ row }) => rankOrNA(row[field]),
        });
        if (useSequence) cols.push(category("sequenceRank", "Sequence"));
        if (element.usecCREs) cols.push(category("elementRank", "Element"));
        if (gene.useGenes) cols.push(category("geneRank", "Gene"));
        return cols;
    }, [useSequence, element.usecCREs, gene.useGenes]);

    // With auto sort on, selected rows float to the top; otherwise sort by aggregate rank
    useEffect(() => {
        apiRef.current?.setSortModel(autoSort && selected.size > 0 ? SELECTED_FIRST_SORT : AGGREGATE_SORT);
    }, [apiRef, autoSort, selected]);

    const toolbarExtra = useMemo(() => <AutoSortSwitch autoSort={autoSort} setAutoSort={setAutoSort} />, [autoSort]);
    const selectionModel = useMemo(() => ({ type: "include" as const, ids: selected }), [selected]);

    return (
        <Box mt="20px">
            <Table
                apiRef={apiRef}
                columns={columns}
                rows={rows}
                loading={loading}
                initialState={{ sorting: { sortModel: AGGREGATE_SORT } }}
                divHeight={{ height: "440px", maxHeight: "440px" }}
                slotProps={{ toolbar: { extra: toolbarExtra } }}
                label={
                    <Tooltip title="Select a row to isolate it" arrow placement="top-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <InfoOutlined fontSize="small" />
                            <Typography>Ranked Regions</Typography>
                        </Stack>
                    </Tooltip>
                }
                checkboxSelection
                getRowId={(row) => row.regionID}
                onRowSelectionModelChange={(model) => onSelectedChange(new Set(model.ids as Set<RegionID>))}
                rowSelectionModel={selectionModel}
                keepNonExistentRowsSelected
            />
        </Box>
    );
}
