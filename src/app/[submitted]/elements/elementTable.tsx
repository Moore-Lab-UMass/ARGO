import React, { useMemo } from "react";
import { ElementTableProps, ElementTableRow } from "../../types";
import { Link, Tooltip, useTheme } from "@mui/material";
import { useQuery } from "@apollo/client";
import { client } from "../../client";
import { ORTHOLOG_QUERY, Z_SCORES_QUERY } from "../../queries";
import { mapScoresCTSpecific, mapScores } from "./elementHelpers";
import {
    GridColDef,
    Table,
} from "@weng-lab/ui-components";

const ElementTable: React.FC<ElementTableProps> = ({
    elementFilterVariables,
    SubTableTitle,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateElementRows,
    updateLoadingElementRows
}) => {
    const theme = useTheme();

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

    // Filter cCREs based on class and ortholog
    const elementRows: ElementTableRow[] = useMemo(() => {
        if (error_ortho || error_scores)
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

    }, [allElementData, elementFilterVariables.cCREAssembly, elementFilterVariables.classes, elementFilterVariables.mustHaveOrtholog, loading_ortho, loading_scores, orthoData, error_ortho, error_scores]);

    updateElementRows(elementRows)
    const loadingRows = loading_ortho || loading_scores || loadingIntersect;
    updateLoadingElementRows(loadingRows);

    //handle column changes for the Element rank table
    const elementColumns: GridColDef<ElementTableRow>[] = useMemo(() => {
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
    }, [elementFilterVariables]);

    return (
        <Table
            key={Math.random()}
            columns={elementColumns}
            rows={elementRows === null ? [] : isolatedRows ? isolatedRows.element : elementRows}
            initialState={{
                sorting: {
                    sortModel: Object.values(elementFilterVariables.assays).some(value => value) ? [{ field: "dnase", sort: "desc" }] : [{ field: "regionID", sort: "desc" }],
                },
            }}
            loading={loadingRows}
            label={<SubTableTitle title="Element Details (Overlapping cCREs)" table="elements" />}
            // headerColor={{ backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit" }}
            downloadFileName="ElementRanks.tsv"
            divHeight={{ height: loadingRows ? "440px" : "100%", maxHeight: "440px" }}
            emptyTableFallback={"No Overlapping cCREs"}
            slotProps={{
                toolbar: {
                    sx: {
                        backgroundColor: theme.palette.secondary.light,
                    },
                },
            }}
        />
    )
}
export default ElementTable;