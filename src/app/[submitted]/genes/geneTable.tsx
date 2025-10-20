import React, { useMemo, useState } from "react";
import { AllLinkedGenes, ComputationalMethod, GeneTableProps, GeneTableRow, LinkedGenes } from "../../types";
import { GridColDef, Table } from "@weng-lab/ui-components";
import { Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { useLazyQuery, useQuery } from "@apollo/client";
import { client } from "../../client";
import { CLOSEST_QUERY, SPECIFICITY_QUERY, GENE_EXP_QUERY, GENE_ORTHO_QUERY, LINKED_GENES_QUERY, COMPUTATIONAL_LNKED_GENES_QUERY } from "../../queries";
import { parseLinkedGenes, parseClosestGenes, parseComputationalGenes, filterOrthologGenes, getSpecificityScores, getExpressionScores } from "./geneHelpers";
import GenesModal from "./linkedGenesModal";
import { AggregateByEnum } from "../../../graphql/__generated__/graphql";
import GeneLink from "../../_utility/GeneLink";

const computationalMethods: ComputationalMethod[] = [
    "ABC_(DNase_only)",
    "ABC_(full)",
    "EPIraction",
    "GraphRegLR",
    "rE2G_(DNase_only)",
    "rE2G_(extended)"
];

const GeneTable: React.FC<GeneTableProps> = ({
    geneFilterVariables,
    SubTableTitle,
    intersectingCcres,
    loadingIntersect,
    isolatedRows,
    updateGeneRows,
    updateLoadingGeneRows
}) => {
    const theme = useTheme();
    const [getOrthoGenes, { data: orthoGenes }] = useLazyQuery(GENE_ORTHO_QUERY)
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        genes: LinkedGenes;
    } | null>(null);

    //Query to get the closest gene to eah ccre
    const { loading: loading_closest_genes, data: closestGeneData, error: error_closest_genes } = useQuery(CLOSEST_QUERY, {
        variables: {
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: !intersectingCcres || geneFilterVariables.methodOfLinkage !== "distance",
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_linked_genes, data: linkedGenesData, error: error_linked_genes } = useQuery(LINKED_GENES_QUERY, {
        variables: {
            accession: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
            assembly: "grch38",
            celltype: geneFilterVariables.linkageBiosample ? geneFilterVariables.linkageBiosample.cellType : [],
            assaytype: geneFilterVariables.methodOfLinkage.replace("_", "-")
        },
        skip: !intersectingCcres || geneFilterVariables.methodOfLinkage === "distance" || computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod),
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_computational_genes, data: computationalGenesData, error: error_computational_genes } = useQuery(COMPUTATIONAL_LNKED_GENES_QUERY, {
        variables: {
            accession: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
            biosample_value: geneFilterVariables.linkageBiosample ? geneFilterVariables.linkageBiosample.name : [],
            method: geneFilterVariables.methodOfLinkage
        },
        skip: !intersectingCcres || !computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod),
        client: client,
        fetchPolicy: 'cache-first',
    });

    const filteredGenes = useMemo<AllLinkedGenes>(() => {
        if (!intersectingCcres || (geneFilterVariables.methodOfLinkage === "distance" && !closestGeneData) || (geneFilterVariables.methodOfLinkage !== "distance" && !computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !linkedGenesData) || (computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod) && !computationalGenesData)) {
            return [];
        }

        let linkedGenes: AllLinkedGenes = [];

        if (geneFilterVariables.methodOfLinkage === "distance") {
            //switch between protein coding and all closest gene
            let closestGenes = closestGeneData.closestGenetocCRE.filter((gene) => gene.gene.type === "ALL")
            if (geneFilterVariables.mustBeProteinCoding) {
                closestGenes = closestGeneData.closestGenetocCRE.filter((gene) => gene.gene.type === "PC")
            }
            linkedGenes = parseClosestGenes(closestGenes);
        } else if (computationalMethods.includes(geneFilterVariables.methodOfLinkage as ComputationalMethod)) {
            //switch between protein coding and all linked genes
            const computationalGenes = geneFilterVariables.mustBeProteinCoding ? computationalGenesData?.ComputationalGeneLinksQuery.filter((gene) => gene.genetype === "protein_coding")
                : computationalGenesData?.ComputationalGeneLinksQuery

            linkedGenes = parseComputationalGenes(computationalGenes, geneFilterVariables.methodOfLinkage as ComputationalMethod, intersectingCcres);
        } else {
            const initialFilter = linkedGenesData.linkedGenesQuery.filter((gene) => gene.assay !== 'CRISPRi-FlowFISH' || (gene.assay === 'CRISPRi-FlowFISH' && gene.p_val < 0.05))

            //switch between protein coding and all linked genes
            const filteredLinkedGenes = geneFilterVariables.mustBeProteinCoding ? initialFilter.filter((gene) => gene.genetype === "protein_coding")
                : initialFilter
            linkedGenes = parseLinkedGenes(filteredLinkedGenes, geneFilterVariables.methodOfLinkage);
        }

        const uniqueGeneNames = Array.from(
            new Set(
                linkedGenes.flatMap((item) => item.genes.map((gene) => gene.name.trim()))
            )
        );

        let filteringGenes = linkedGenes;
        if (geneFilterVariables.mustHaveOrtholog) {
            getOrthoGenes({
                variables: {
                    name: uniqueGeneNames,
                    assembly: "grch38"
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
            if (orthoGenes) {
                filteringGenes = filterOrthologGenes(orthoGenes, linkedGenes)
            }
        }

        return filteringGenes.length > 0 ? filteringGenes : null;

    }, [closestGeneData, computationalGenesData, geneFilterVariables.methodOfLinkage, geneFilterVariables.mustBeProteinCoding, geneFilterVariables.mustHaveOrtholog, getOrthoGenes, intersectingCcres, linkedGenesData, orthoGenes])

    const { loading: loading_gene_specificity, data: geneSpecificity } = useQuery(SPECIFICITY_QUERY, {
        variables: {
            geneids: filteredGenes?.flatMap((entry) =>
                entry.genes.map((gene) => gene.geneId.split('.')[0])
            )
        },
        skip: filteredGenes === null,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_gene_expression, data: geneExpression, error: error_gene_expression } = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: filteredGenes?.flatMap((entry) => entry.genes.map((gene) => gene.geneId.split('.')[0])),
            biosample: geneFilterVariables.selectedBiosample ? geneFilterVariables.selectedBiosample.name : [],
            aggregateBy: (geneFilterVariables.rankGeneExpBy === "avg" ? "AVERAGE" : "MAX") as AggregateByEnum
        },
        skip: filteredGenes === null,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const geneRows = useMemo<GeneTableRow[]>(() => {
        if (filteredGenes === null || error_gene_expression || error_linked_genes || error_closest_genes || error_computational_genes) {
            return null
        }
        if (filteredGenes.length === 0) {
            return []
        }

        const specificityRows = geneSpecificity ? getSpecificityScores(filteredGenes, intersectingCcres, geneSpecificity, geneFilterVariables) : []
        const expressionRows = geneExpression ? getExpressionScores(filteredGenes, intersectingCcres, geneExpression, geneFilterVariables) : []

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
        if (geneSpecificity && geneExpression) {
            return mergedRows
        } else {
            return []
        }

    }, [filteredGenes, error_gene_expression, error_linked_genes, error_closest_genes, error_computational_genes, geneSpecificity, intersectingCcres, geneFilterVariables, geneExpression]);

    updateGeneRows(geneRows)
    const loadingRows = loading_gene_expression || loading_gene_specificity || loading_closest_genes || loadingIntersect || loading_linked_genes || loading_computational_genes;
    updateLoadingGeneRows(loadingRows);

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
                            <GeneLink assembly="GRCh38" geneName={geneName.trim()} />
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
                            <GeneLink assembly="GRCh38" geneName={geneName.trim()} />
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
                label={<SubTableTitle title="Gene Details" table="genes" />}
                downloadFileName="GeneRanks.tsv"
                emptyTableFallback={"No Gene Information"}
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