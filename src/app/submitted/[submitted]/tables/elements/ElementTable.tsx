import React, { useEffect, useMemo } from "react";
import { ElementTableProps, ElementTableRow } from "../../../../types";
import { Link, Stack, Tooltip } from "@mui/material";
import { useQuery } from "@apollo/client";
import { client } from "../../../../client";
import { ORTHOLOG_QUERY, Z_SCORES_QUERY } from "../../../../queries";
import { mapScoresCTSpecific, mapScores } from "./elementHelpers";
import { GridColDef, GridRenderCellParams, Table } from "@weng-lab/ui-components";
import { ProportionsBar } from "@weng-lab/visualization";
import { GROUP_COLOR_MAP } from "../../../../_utility/colors";

const ElementTable: React.FC<ElementTableProps> = ({
    elementFilterVariables,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateElementRows,
    updateLoadingElementRows,
    ToolBarIcon
}) => {

    //query to get orthologous cCREs of the intersecting cCREs (also used in gene)
    const { loading: loading_ortho, data: orthoData, error: error_ortho } = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: "GRCh38",
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: (!elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") || !intersectingCcres,
        client: client,
        fetchPolicy: 'cache-first',
    })

    const mouseAccessions = useMemo(() => {
        if (elementFilterVariables.cCREAssembly === "mm10") {
            return orthoData?.orthologQuery
                .flatMap(entry => entry.ortholog)
                .map(orthologEntry => orthologEntry.accession);
        }
    }, [elementFilterVariables.cCREAssembly, orthoData?.orthologQuery]);

    //Query to get the assay zscores of the intersecting ccres
    const { loading: loading_scores, data: zScoreData, error: error_scores } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: elementFilterVariables.cCREAssembly === "mm10" ? mouseAccessions : intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
            cellType: elementFilterVariables.selectedBiosample ? elementFilterVariables.selectedBiosample.name : null
        },
        skip: !intersectingCcres || (elementFilterVariables.cCREAssembly === "mm10" && !mouseAccessions),
        client: client,
        fetchPolicy: 'cache-first',
    });

    //all data pertaining to the element table
    const allElementData: ElementTableRow[] = useMemo(() => {
        if (!zScoreData) return [];
        const data = zScoreData['cCRESCREENSearch'];
        let mapObj = intersectingCcres;

        //use mouse accesion instead if mm10 selected
        if (elementFilterVariables.cCREAssembly === "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            mapObj = intersectingCcres
                .map((ccre) => ({
                    ...ccre,
                    accession: orthologMapping[ccre.accession]
                }))
                .filter((ccre) => ccre.accession !== undefined);
        }

        //map assay scores bsed on selected biosample
        if (elementFilterVariables.selectedBiosample) {
            return mapObj.map(obj => mapScoresCTSpecific(obj, data));
        } else {
            return mapObj.map(obj => mapScores(obj, data));
        }
    }, [zScoreData, intersectingCcres, elementFilterVariables.cCREAssembly, elementFilterVariables.selectedBiosample, orthoData]);

    const errorElements = error_ortho || error_scores

    // Filter cCREs based on class and ortholog
    const elementRows: ElementTableRow[] = useMemo(() => {
        if (errorElements)
            if (allElementData.length === 0 || loading_scores || loading_ortho) {
                return [];
            }
        let data = allElementData;
        //filter through ortholog
        if (elementFilterVariables.mustHaveOrtholog && orthoData && elementFilterVariables.cCREAssembly !== "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            data = data
                .map((row) => ({
                    ...row,
                    ortholog: orthologMapping[row.accession]
                }))
                .filter((row) => row.ortholog !== undefined);
        }
        //filter through classes return if the data set i fully filtered
        const filteredClasses = data.filter(row => elementFilterVariables.classes[row.class] !== false);
        if (filteredClasses.length === 0) {
            return null
        }

        return filteredClasses;

    }, [errorElements, allElementData, loading_scores, loading_ortho, elementFilterVariables.mustHaveOrtholog, elementFilterVariables.cCREAssembly, elementFilterVariables.classes, orthoData]);

    useEffect(() => {
        if (!elementRows) return
        updateElementRows(elementRows)
    }, [elementRows, updateElementRows])

    const loadingRows = loading_ortho || loading_scores || loadingIntersect;

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
                            href={`https://screen.wenglab.org/search?assembly=${elementFilterVariables.cCREAssembly}&chromosome=${params.row.chr}&start=${params.row.start}&end=${params.row.end}&accessions=${params.row.accession}&page=2`}
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
                toolbarStyle={{backgroundColor: "#e7eef8"}}
                error={errorElements ? true : false}
            />
        </Stack>
    )
}

export default ElementTable;