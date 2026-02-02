import React, { useEffect, useMemo, useState } from "react";
import { AllLinkedGenes, ComputationalMethod, GeneTableProps, GeneTableRow, LinkedGenes } from "../../../../types";
import { GridColDef, Table } from "@weng-lab/ui-components";
import { Link, Stack, Tooltip, Typography } from "@mui/material";
import { useLazyQuery } from "@apollo/client";
import { GENE_ORTHO_QUERY } from "../../../../queries";
import { getSpecificityScores, getExpressionScores, computationalMethods, filterGenes } from "./geneHelpers";
import GenesModal from "./linkedGenesModal";
import { useLinkedGenes } from "../../../../hooks/useLinkedGenes";
import { useGeneScores } from "../../../../hooks/useGeneScores";

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateGeneRows,
    updateLoadingGeneRows,
    ToolBarIcon
}) => {
    const [getOrthoGenes, { data: orthoGenes }] = useLazyQuery(GENE_ORTHO_QUERY)
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        genes: LinkedGenes;
    } | null>(null);

    const {
        closest,
        linked,
        computational,
        loading,
        error,
    } = useLinkedGenes({
        intersectingCcres,
        geneFilterVariables,
    });

    const filteredGenes = useMemo<AllLinkedGenes>(() => {
        if (!intersectingCcres || 
            (geneFilterVariables.methodOfLinkage === "distance" && !closest.data) || 
            (geneFilterVariables.methodOfLinkage !== "distance" && !computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !linked.data) || 
            (computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !computational.data)) {
            return [];
        }

        const genes = filterGenes({
            closestData: closest.data,
            linkedData: linked.data,
            computationalData: computational.data,
            intersectingCcres,
            geneFilterVariables,
            getOrthoGenes,
            orthoGenes,
        })

        return genes;

    }, [closest.data, computational.data, geneFilterVariables, getOrthoGenes, intersectingCcres, linked.data, orthoGenes])

    const {
        specificity,
        expression,
        loading: loadingGeneScores,
    } = useGeneScores({
        filteredGenes,
        geneFilterVariables,
    });

    const errorGenes = expression.error || error;
    const loadingRows = loadingGeneScores || loadingIntersect || loading;

    const geneRows = useMemo<GeneTableRow[]>(() => {
        if (filteredGenes === null || errorGenes) {
            return null
        }
        if (filteredGenes.length === 0) {
            return []
        }

        const specificityRows = specificity.data ? getSpecificityScores(filteredGenes, intersectingCcres, specificity.data, geneFilterVariables) : []
        const expressionRows = expression.data ? getExpressionScores(filteredGenes, intersectingCcres, expression.data, geneFilterVariables) : []

        const mergedRowsMap = new Map<string | number, GeneTableRow>();

        specificityRows.forEach(row => {
            mergedRowsMap.set(row.regionID, { ...row });
        });

        // Process expressionRows, merging data when `regionID` matches
        expressionRows.forEach(row => {
            if (mergedRowsMap.has(row.regionID)) {
                mergedRowsMap.set(row.regionID, {
                    ...mergedRowsMap.get(row.regionID),
                    geneExpression: row.geneExpression,
                });
            } else {
                // Otherwise, add as a new entry
                mergedRowsMap.set(row.regionID, { ...row });
            }
        });

        // Convert map back to an array
        const mergedRows = Array.from(mergedRowsMap.values());
        if (specificity.data && expression.data) {
            return mergedRows
        } else {
            return []
        }

    }, [filteredGenes, errorGenes, specificity.data, intersectingCcres, geneFilterVariables, expression.data]);

    useEffect(() => {
        if (!geneRows) return
        updateGeneRows(geneRows)
    }, [geneRows, updateGeneRows])

    useEffect(() => {
        updateLoadingGeneRows(loadingRows);
    }, [loadingRows, updateLoadingGeneRows]);

    //handle column changes for the Gene rank table
    const geneColumns: GridColDef<GeneTableRow>[] = useMemo(() => {
        const cols: GridColDef<GeneTableRow>[] = [
            {
                field: "regionID",
                headerName: "Region ID",
                valueGetter: (_, row) => row.regionID,
            },
        ];

        if (geneFilterVariables.useGenes) {
            cols.push({
                field: "geneExpression",
                headerName: "Gene Expression",
                description: "TPM",
                sortable: true,
                valueGetter: (_, row) => row.geneExpression?.score ?? null,
                renderCell: (params) => {
                    const row = params.row;
                    if (!row.geneExpression) return "N/A";
                    const { score, geneName, linkedBy } = row.geneExpression;

                    return geneName !== "Average" ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Tooltip
                                title={
                                    linkedBy ? (
                                        <span>
                                            <strong>Linked By:</strong> {linkedBy}
                                        </span>
                                    ) : (
                                        ""
                                    )
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize="14px">{score.toFixed(2)}</Typography>
                            </Tooltip>
                            <Tooltip title={"Open gene in SCREEN"} arrow placement={"right"}>
                                <Link
                                    href={`https://screen.wenglab.org/GRCh38/gene/${geneName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                >
                                    {geneName}
                                </Link>
                            </Tooltip>
                        </Stack>
                    ) : (
                        <Typography fontSize="14px">{score.toFixed(2)}</Typography>
                    );
                },
            });

            cols.push({
                field: "expressionSpecificity",
                headerName: "Expression Specificity",
                sortable: true,
                valueGetter: (_, row) => row.expressionSpecificity?.score ?? null,
                renderCell: (params) => {
                    const row = params.row;
                    if (!row.expressionSpecificity) return "N/A";
                    const { score, geneName, linkedBy } = row.expressionSpecificity;

                    return geneName !== "Average" ? (
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Tooltip
                                title={
                                    linkedBy ? (
                                        <span>
                                            <strong>Linked By:</strong> {linkedBy}
                                        </span>
                                    ) : (
                                        ""
                                    )
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize="14px">{score.toFixed(2)}</Typography>
                            </Tooltip>
                            <Tooltip title={"Open gene in SCREEN"} arrow placement={"right"}>
                                <Link
                                    href={`https://screen.wenglab.org/GRCh38/gene/${geneName}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                >
                                    {geneName}
                                </Link>
                            </Tooltip>
                        </Stack>
                    ) : (
                        <Typography fontSize="14px">{score.toFixed(2)}</Typography>
                    );
                },
            });

            cols.push({
                field: "linkedGenes",
                headerName: "# of Linked Genes",
                sortable: true,
                valueGetter: (_, row) => row.linkedGenes?.length ?? 0,
                renderCell: (params) => {
                    const row = params.row;
                    return (
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                fontFamily: "arial, sans-serif",
                                color: "#030f98",
                                cursor: "pointer",
                                outline: "none",
                            }}
                            onClick={() =>
                                setModalData({
                                    open: true,
                                    chromosome: row.inputRegion.chr,
                                    start: row.inputRegion.start,
                                    end: row.inputRegion.end,
                                    genes: row.linkedGenes,
                                })
                            }
                        >
                            {row.linkedGenes?.length ?? 0}
                        </button>
                    );
                },
            });
        }

        return cols;
    }, [geneFilterVariables]);

    return (
        <>
            <Table
                key={Math.random()}
                columns={geneColumns}
                rows={geneRows === null ? [] : isolatedRows ?? geneRows}
                loading={loadingRows}
                initialState={{
                    sorting: {
                        sortModel: [{ field: "geneExpression", sort: "desc" }],
                    },
                }}
                divHeight={{ height: loadingRows ? "440px" : "100%", maxHeight: "440px" }}
                label={"Gene Details"}
                downloadFileName="GeneRanks.tsv"
                emptyTableFallback={"No Linked Genes"}
                toolbarSlot={ToolBarIcon}
                toolbarStyle={{backgroundColor: "#e7eef8"}}
                error={errorGenes ? true : false}
            />
            {modalData && (
                <GenesModal
                    key={`${modalData?.chromosome}-${modalData?.start}-${modalData?.end}`}
                    open={modalData?.open || false}
                    setOpen={(isOpen) =>
                        setModalData((prev) => (prev ? { ...prev, open: isOpen } : null))
                    }
                    chromosome={modalData?.chromosome || ""}
                    start={modalData?.start || 0}
                    end={modalData?.end || 0}
                    genes={modalData?.genes || []}
                />
            )}
        </>
    )
}

export default GeneTable;