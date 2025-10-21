import React, { useMemo } from "react";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { InputRegions, MainTableRow, RankedRegions } from "../../../types";
import { GRID_CHECKBOX_SELECTION_COL_DEF, GridColDef, GridRowSelectionModel, Table } from "@weng-lab/ui-components";
import { calculateAggregateRanks, matchRanks } from "./helpers";

export interface RankedRegionsTableProps {
    inputRegions: InputRegions;
    elementRanks: RankedRegions;
    sequenceRanks: RankedRegions;
    geneRanks: RankedRegions;
    loading: boolean;
    selected: MainTableRow[];
    setSelected: (selected: MainTableRow[]) => void;
    useConservation: boolean;
    useMotifs: boolean;
    useCcres: boolean;
    useGenes: boolean;
}

const RankedRegionsTable: React.FC<RankedRegionsTableProps> = ({
    inputRegions,
    elementRanks,
    sequenceRanks,
    geneRanks,
    loading,
    selected,
    setSelected,
    useConservation,
    useMotifs,
    useCcres,
    useGenes
}) => {

    const handleRowSelectionModelChange = (ids: GridRowSelectionModel) => {
        const newIds = Array.from(ids.ids);
        const selectedRows = newIds.map((id) => mainRows.find((row) => row.regionID === id));
        setSelected(selectedRows);
    };

    //find the matching ranks for each input region and update the rows of the main table
    const mainRows: MainTableRow[] = useMemo(() => {
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];

        const aggregateRanks = calculateAggregateRanks(inputRegions, sequenceRanks, elementRanks, geneRanks)
        const updatedMainRows = matchRanks(inputRegions, sequenceRanks, elementRanks, geneRanks, aggregateRanks)

        return updatedMainRows;
    }, [elementRanks, geneRanks, inputRegions, sequenceRanks]);

    //This is used to prevent sorting from happening when clicking on the header checkbox
    const StopPropagationWrapper = (params) => (
        <div id={"StopPropagationWrapper"} onClick={(e) => e.stopPropagation()}>
            <GRID_CHECKBOX_SELECTION_COL_DEF.renderHeader {...params} />
        </div>
    );

    //handle column changes for the main rank table
    const mainColumns: GridColDef<MainTableRow>[] = useMemo(() => {
        const cols: GridColDef<MainTableRow>[] = [
            {
                ...(GRID_CHECKBOX_SELECTION_COL_DEF as GridColDef<MainTableRow>), //Override checkbox column https://mui.com/x/react-data-grid/row-selection/#custom-checkbox-column
                sortable: true,
                hideable: false,
                renderHeader: StopPropagationWrapper,
            },
            {
                field: "regionID",
                headerName: "Region ID",
            },
            {
                field: "inputRegion",
                headerName: "Input Region",
                valueGetter: (_, row) => {
                    const { chr, start, end } = row.inputRegion;
                    return `${chr}: ${start}-${end}`;
                },
            },
            {
                field: "aggregateRank",
                headerName: "Aggregate",
            },
        ];

        const naSortComparator = (a: number | string, b: number | string) => {
            // Handle "N/A" or 0 specially to put N/A at the bottom of the sort
            const isANa = a === "N/A" || a === 0;
            const isBNa = b === "N/A" || b === 0;

            if (isANa && !isBNa) return 1;
            if (!isANa && isBNa) return -1;
            if (isANa && isBNa) return 0;

            // Otherwise, normal numeric comparison
            return Number(a) - Number(b);
        };

        if (useConservation || useMotifs) {
            cols.push({
                field: "sequenceRank",
                headerName: "Sequence",
                sortComparator: naSortComparator,
                renderCell: (params) =>
                    params.row.elementRank === 0 ? "N/A" : params.row.elementRank,
            });
        }

        if (useCcres) {
            cols.push({
                field: "elementRank",
                headerName: "Element",
                sortComparator: naSortComparator,
                renderCell: (params) =>
                    params.row.elementRank === 0 ? "N/A" : params.row.elementRank,
            });
        }

        if (useGenes) {
            cols.push({
                field: "geneRank",
                headerName: "Gene",
                sortComparator: naSortComparator,
                renderCell: (params) =>
                    params.row.geneRank === 0 ? "N/A" : params.row.geneRank,
            });
        }

        return cols;
    }, [
        useCcres,
        useGenes,
        useConservation,
        useMotifs,
    ]);

    return (
        <Box mt="20px" id="123456">
            <Table
                key={
                    JSON.stringify(inputRegions) +
                    JSON.stringify(elementRanks) +
                    JSON.stringify(sequenceRanks) +
                    JSON.stringify(geneRanks)
                }
                columns={mainColumns}
                rows={mainRows}
                loading={loading}
                initialState={{
                    sorting: {
                        sortModel: [{ field: "aggregateRank", sort: "asc" }],
                    },
                }}
                divHeight={{
                    height: loading ? "440px" : "100%",
                    maxHeight: "440px",
                }}
                label={
                    <Tooltip title="Select a row to isolate it" arrow placement="top-start">
                        <Stack direction="row" spacing={1} alignItems="center">
                            <InfoOutlined
                                fontSize="small"
                            />
                            <Typography>Ranked Regions</Typography>
                        </Stack>
                    </Tooltip>
                }
                checkboxSelection
                getRowId={(row) => row.regionID}
                onRowSelectionModelChange={handleRowSelectionModelChange}
                rowSelectionModel={{
                    type: "include",
                    ids: new Set(selected.map((x) => x.regionID)),
                }}
                keepNonExistentRowsSelected
                downloadFileName="AggregateRanks.tsv"
            />
        </Box>
    );
};

export default RankedRegionsTable;
