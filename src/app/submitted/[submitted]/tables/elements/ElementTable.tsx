import React, { useEffect, useMemo } from "react";
import { ElementTableProps, ElementTableRow } from "../../../../types";
import { Link, Stack, Tooltip } from "@mui/material";
import { mapScoresCTSpecific, mapScores, buildOrthologMap, filterElements } from "./elementHelpers";
import { GridColDef, GridRenderCellParams, Table } from "@weng-lab/ui-components";
import { ProportionsBar } from "@weng-lab/visualization";
import { GROUP_COLOR_MAP } from "../../../../_utility/colors";
import { useElementData } from "../../../../hooks/useElementData";

const ElementTable: React.FC<ElementTableProps> = ({
    elementFilterVariables,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateElementRows,
    updateLoadingElementRows,
    ToolBarIcon
}) => {

    const {
        ortho,
        zScores,
        loading,
        error,
    } = useElementData({
        intersectingCcres,
        elementFilterVariables,
    });

    //all data pertaining to the element table
    const allElementData: ElementTableRow[] = useMemo(() => {
        if (!zScores.data) return [];

        const data = zScores.data.cCRESCREENSearch;
        const orthoMap = buildOrthologMap(ortho.data);

        const baseCcres =
            elementFilterVariables.cCREAssembly === 'mm10'
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

    // Filter cCREs based on class and ortholog
    const elementRows: ElementTableRow[] | null = useMemo(() => {
        if (loading || error || allElementData.length === 0) {
            return [];
        }

        const filteredElements = filterElements({
            allElementData,
            orthoData: ortho.data,
            elementFilterVariables,
        })

        return filteredElements;
    }, [loading, error, allElementData, ortho.data, elementFilterVariables]);

    useEffect(() => {
        if (!elementRows) return
        updateElementRows(elementRows)
    }, [elementRows, updateElementRows])

    const loadingRows = loading || loadingIntersect;

    useEffect(() => {
        updateLoadingElementRows(loadingRows);
    }, [loadingRows, updateLoadingElementRows]);

    //handle column changes for the Element rank table
    const elementColumns: GridColDef<ElementTableRow>[] = useMemo(() => {

        const classificationFormatting: Partial<GridColDef> = {
            renderCell: (params: GridRenderCellParams) => {
                const group = params.value as string;
                if (!group) return null;

                let mapValue = GROUP_COLOR_MAP.get(group);

                if (!mapValue) {
                    for (const [, value] of GROUP_COLOR_MAP.entries()) {
                        const [label] = value.split(":");
                        if (label === group) {
                            mapValue = value;
                            break;
                        }
                    }
                }

                const [label, color] = mapValue
                    ? mapValue.split(":")
                    : ["Unknown", "black"];

                const textColor = group === "InActive" ? "gray" : color;

                return (
                    <span
                        style={{
                            color: textColor,
                            fontWeight: "bold",
                        }}>
                        {label}
                    </span>
                );
            },
        };

        const cols: GridColDef<ElementTableRow>[] = [
            {
                field: "regionID",
                headerName: "Region ID",
            },
            {
                field: "class",
                headerName: "Class",
                valueGetter: (_, row) => {
                    const c = row.class;
                    if (c === "PLS") return "Promoter";
                    if (c === "pELS") return "Proximal Enhancer";
                    if (c === "dELS") return "Distal Enhancer";
                    return c;
                },
                ...classificationFormatting
            },
            {
                field: "accession",
                headerName: "Accession",
                renderCell: (params) => (
                    <Tooltip title="Open cCRE In SCREEN" arrow placement="left">
                        <Link
                            href={`https://screen.wenglab.org/${elementFilterVariables.cCREAssembly}/ccre/${params.row.accession}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="none"
                        >
                            {params.row.accession}
                        </Link>
                    </Tooltip>
                ),
            },
        ];

        if (elementFilterVariables.usecCREs) {
            if (
                elementFilterVariables.mustHaveOrtholog &&
                elementFilterVariables.cCREAssembly !== "mm10"
            ) {
                cols.push({
                    field: "ortholog",
                    headerName: "Orthologous Accession",
                    renderCell: (params) => (
                        <Tooltip title="Open cCRE In SCREEN" arrow placement="left">
                            <Link
                                href={`https://screen.wenglab.org/mm10/ccre/${params.row.ortholog}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                underline="none"
                            >
                                {params.row.ortholog}
                            </Link>
                        </Tooltip>
                    ),
                });
            }

            const assays = elementFilterVariables.assays;
            const addAssayCol = (key: keyof ElementTableRow, label: string) => {
                cols.push({
                    field: key,
                    headerName: label,
                    valueGetter: (_, row) => {
                        const val = row[key];
                        return typeof val === "number" && val !== null ? val.toFixed(2) : val;
                    },
                });
            };

            if (assays.dnase) addAssayCol("dnase", "DNase");
            if (assays.h3k4me3) addAssayCol("h3k4me3", "H3K4me3");
            if (assays.h3k27ac) addAssayCol("h3k27ac", "H3K27ac");
            if (assays.ctcf) addAssayCol("ctcf", "CTCF");
            if (assays.atac) addAssayCol("atac", "ATAC");
        }

        return cols;
    }, [elementFilterVariables.assays, elementFilterVariables.cCREAssembly, elementFilterVariables.mustHaveOrtholog, elementFilterVariables.usecCREs]);

    const classProportions = useMemo(() => {
        if (!elementRows || elementRows.length === 0) return {};

        const counts: Record<string, number> = {};
        for (const row of elementRows) {
            const cls = row.class;
            counts[cls] = (counts[cls] ?? 0) + 1;
        }

        return counts;
    }, [elementRows]);

    return (
        <Stack spacing={1}>
            {(elementRows?.length > 0 || loadingRows) && (
                <ProportionsBar
                    data={classProportions}
                    loading={loadingRows}
                    tooltipTitle="cCRE Classification Proportions"
                    getColor={(key) => GROUP_COLOR_MAP.get(key).split(":")[1] ?? "black"}
                    formatLabel={(key) => GROUP_COLOR_MAP.get(key).split(":")[0] ?? key}
                    sortDescending
                    label="cCRE Classification Proportions"
                />
            )}
            <Table
                key={Math.random()}
                columns={elementColumns}
                rows={elementRows === null ? [] : isolatedRows ?? elementRows}
                initialState={{
                    sorting: {
                        sortModel: Object.values(elementFilterVariables.assays).some(value => value) ? [{ field: "dnase", sort: "desc" }] : [{ field: "regionID", sort: "desc" }],
                    },
                }}
                loading={loadingRows}
                label={"Element Details (Overlapping cCREs)"}
                downloadFileName="ElementRanks.tsv"
                divHeight={{ height: loadingRows ? "440px" : "100%", maxHeight: "440px" }}
                emptyTableFallback={"No Overlapping cCREs"}
                toolbarSlot={ToolBarIcon}
                toolbarStyle={{ backgroundColor: "#e7eef8" }}
                error={error ? true : false}
            />
        </Stack>
    )
}

export default ElementTable;