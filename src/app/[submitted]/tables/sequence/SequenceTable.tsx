import React, { useEffect, useMemo, useState } from "react";
import { DataScource, MotifQuality, MotifRanking, SequenceTableProps, SequenceTableRow } from "../../../types";
import MotifsModal, { MotifProps } from "./MotifModal";
import { Tooltip, Typography } from "@mui/material";
import { useQuery } from "@apollo/client";
import { client } from "../../../client";
import { ALLELE_QUERY, MOTIF_RANKING_QUERY } from "../../../queries";
import { calculateConservationScores, calculateMotifScores, getNumOverlappingMotifs } from "./sequenceHelpers";
import Link from "next/link";
import { GridColDef, Table } from "@weng-lab/ui-components";
import TableToTop from "../../../components/TableToTop";

const SequenceTable: React.FC<SequenceTableProps> = ({
    sequenceFilterVariables,
    inputRegions,
    isolatedRows,
    updateSequenceRows,
    updateLoadingSequenceRows,
    setTableOrder
}) => {
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        motifs: MotifProps[];
    } | null>(null);

    const urlMapping: { [key: string]: string } = {
        "241-mam-phyloP": "https://downloads.wenglab.org/241-mammalian-2020v2.bigWig",
        "241-mam-phastCons": "https://downloads.wenglab.org/241Mammals-PhastCons.bigWig",
        "447-mam-phyloP": "https://downloads.wenglab.org/mammals_phyloP-447.bigWig",
        "100-vert-phyloP": "https://downloads.wenglab.org/hg38.phyloP100way.bw",
        "100-vert-phastCons": "https://downloads.wenglab.org/hg38.phastCons100way.bw",
        "243-prim-phastCons": "https://downloads.wenglab.org/primates_PhastCons-243.bigWig",
        "43-prim-phyloP": "https://downloads.wenglab.org/PhyloP-43.bw",
        "43-prim-phastCons": "https://downloads.wenglab.org/hg38_43primates_phastCons.bw",
    };

    //query to get conservation scores based on selected url
    const { loading: loading_conservation_scores, data: conservationScores, error: error_conservations_scores } = useQuery(ALLELE_QUERY, {
        variables: {
            requests: {
                url: urlMapping[sequenceFilterVariables.alignment],
                regions: inputRegions.map(({ chr, start, end }) => ({
                    chr1: chr,
                    start,
                    end,
                }))
            }
        },
        skip: !sequenceFilterVariables.useConservation || inputRegions.length === 0,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const { loading: loading_motif_ranking, data: motifRankingScores, error: error_motif_ranking } = useQuery(MOTIF_RANKING_QUERY, {
        variables: {
            motifinputs:
                inputRegions.map(region => ({
                    regionid: region.regionID.toString(),
                    start: region.start,
                    end: region.end,
                    chrom: region.chr,
                    alt: region.alt,
                    ref: region.ref
                }))
        },
        skip: !sequenceFilterVariables.useMotifs,
        client: client,
        fetchPolicy: 'cache-first',
    })

    const sequenceRows: SequenceTableRow[] = useMemo(() => {
        if (error_conservations_scores || error_motif_ranking) {
            return null;
        }
        if ((!conservationScores && !motifRankingScores) || inputRegions.length === 0 || loading_conservation_scores || loading_motif_ranking) {
            return []
        }

        let calculatedConservationScores: SequenceTableRow[] = []
        if (conservationScores) {
            calculatedConservationScores = calculateConservationScores(conservationScores.bigRequestsMultipleRegions, sequenceFilterVariables.rankBy, inputRegions)
        }
        let calculatedMotifScores: SequenceTableRow[] = []
        let filteredMotifs: MotifRanking = []
        if (motifRankingScores) {
            //filter through qualities and data sources
            filteredMotifs = motifRankingScores.motifranking.filter(motif => {
                const motifQuality = motif.motif.split(".").pop();
                const motifDataSource = motif.motif.split(".")[3]
                return sequenceFilterVariables.motifQuality[motifQuality.toLowerCase() as keyof MotifQuality] && motifDataSource.split("").some(letter => sequenceFilterVariables.dataSource[letter.toLowerCase() as keyof DataScource]);
            }).map(motif => ({
                ...motif,
                ref: Number(motif.ref) // Cast ref to a number
            }));

            calculatedMotifScores = calculateMotifScores(inputRegions, filteredMotifs)
        }
        let numOverlappingMotifs: SequenceTableRow[] = []
        if (motifRankingScores && sequenceFilterVariables.numOverlappingMotifs) {
            numOverlappingMotifs = getNumOverlappingMotifs(inputRegions, filteredMotifs)
        }
        // Merge conservation scores and overlapping motifs
        const mergedRows = inputRegions.map(region => {
            const conservationRow = calculatedConservationScores.find(
                row => row.regionID === region.regionID
            )

            const motifScoresRow = calculatedMotifScores.find(
                row => row.regionID === region.regionID
            )

            const numOverlappingMotifsRow = numOverlappingMotifs.find(
                row => row.regionID === region.regionID
            )

            return {
                regionID: region.regionID,
                inputRegion: region,
                conservationScore: conservationRow ? conservationRow.conservationScore : -1000000,
                motifScoreDelta: motifScoresRow?.motifScoreDelta,
                referenceAllele: motifScoresRow ? motifScoresRow.referenceAllele : { sequence: region.ref },
                alt: motifScoresRow ? motifScoresRow.alt : { sequence: region.alt },
                motifID: motifScoresRow?.motifID,
                numOverlappingMotifs: numOverlappingMotifsRow?.numOverlappingMotifs,
                motifs: numOverlappingMotifsRow?.motifs
            }
        })

        return mergedRows

    }, [error_conservations_scores, error_motif_ranking, conservationScores, motifRankingScores, inputRegions, loading_conservation_scores, loading_motif_ranking, sequenceFilterVariables.numOverlappingMotifs, sequenceFilterVariables.rankBy, sequenceFilterVariables.motifQuality, sequenceFilterVariables.dataSource])

    useEffect(() => {
        if (!sequenceRows) return
        updateSequenceRows(sequenceRows)
    }, [sequenceRows, updateSequenceRows])

    const loadingRows = loading_conservation_scores || loading_motif_ranking;

    useEffect(() => {
        updateLoadingSequenceRows(loadingRows);
    }, [loadingRows, updateLoadingSequenceRows]);

    //handle column changes for the Sequence rank table
    const sequenceColumns: GridColDef<SequenceTableRow>[] = useMemo(() => {
        const cols: GridColDef<SequenceTableRow>[] = [
            {
                field: "regionID",
                headerName: "Region ID",
            },
        ];

        // Custom comparator to push N/A to bottom
        const naSortComparator = (a: number | string, b: number | string) => {
            const isANa = a === "N/A" || a == null;
            const isBNa = b === "N/A" || b == null;
            if (isANa && !isBNa) return 1;
            if (!isANa && isBNa) return -1;
            if (isANa && isBNa) return 0;
            return Number(a) - Number(b);
        };

        // 🧬 Conservation score column (based on alignment)
        if (sequenceFilterVariables.useConservation) {
            const labelMap: Record<string, string> = {
                "241-mam-phyloP": "241-Mammal(phyloP)",
                "447-mam-phyloP": "447-Mammal(phyloP)",
                "241-mam-phastCons": "241-Mammal(phastCons)",
                "43-prim-phyloP": "43-Primate(phyloP)",
                "43-prim-phastCons": "43-Primate(phastCons)",
                "243-prim-phastCons": "243-Primate(phastCons)",
                "100-vert-phyloP": "100-Vertebrate(phyloP)",
                "100-vert-phastCons": "100-Vertebrate(phastCons)",
            };

            const label = labelMap[sequenceFilterVariables.alignment];
            if (label) {
                cols.push({
                    field: "conservationScore",
                    headerName: `${label} Score`,
                    renderCell: (params) => {
                        const v = params.row.conservationScore;
                        if (v === -1000000 || v == null) return "N/A";
                        return typeof v === "number" ? v.toFixed(2) : "N/A";
                    },
                    sortComparator: naSortComparator,
                });
            }
        }

        // 🧬 Motif columns
        if (sequenceFilterVariables.useMotifs) {
            const showScore = sequenceFilterVariables.motifScoreDelta;

            // Reference column
            cols.push({
                field: "referenceAllele",
                headerName: showScore ? "Reference Score" : "Reference",
                sortComparator: naSortComparator,
                renderCell: (params) => {
                    const ref = params.row.referenceAllele;
                    if (!ref) return "N/A";
                    if (showScore) {
                        return (
                            <Tooltip
                                title={
                                    <span>
                                        {ref.sequence && (
                                            <>
                                                <strong>Allele:</strong>{" "}
                                                {ref.sequence.length > 5
                                                    ? `${ref.sequence.slice(0, 5)}...`
                                                    : ref.sequence}
                                            </>
                                        )}
                                    </span>
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize="14px">
                                    {ref.score ? Number(ref.score).toFixed(2) : "N/A"}
                                </Typography>
                            </Tooltip>
                        );
                    }
                    return ref.sequence.length > 5
                        ? `${ref.sequence.slice(0, 5)}...`
                        : ref.sequence;
                },
            });

            // Alternate column
            cols.push({
                field: "alt",
                headerName: showScore ? "Alternate Score" : "Alternate",
                sortComparator: naSortComparator,
                renderCell: (params) => {
                    const alt = params.row.alt;
                    if (!alt) return "N/A";
                    if (showScore) {
                        return (
                            <Tooltip
                                title={
                                    <span>
                                        {alt.sequence && (
                                            <>
                                                <strong>Allele:</strong>{" "}
                                                {alt.sequence.length > 5
                                                    ? `${alt.sequence.slice(0, 5)}...`
                                                    : alt.sequence}
                                            </>
                                        )}
                                    </span>
                                }
                                arrow
                                placement="left"
                            >
                                <Typography fontSize="14px">
                                    {alt.score ? alt.score.toFixed(2) : "N/A"}
                                </Typography>
                            </Tooltip>
                        );
                    }
                    return alt.sequence.length > 5
                        ? `${alt.sequence.slice(0, 5)}...`
                        : alt.sequence;
                },
            });

            // Delta column
            if (sequenceFilterVariables.motifScoreDelta) {
                cols.push({
                    field: "motifScoreDelta",
                    headerName: "Delta",
                    renderCell: (params) => {
                        const v = params.row.motifScoreDelta;
                        return v || v === 0 ? v.toFixed(2) : "N/A";
                    },
                    sortComparator: naSortComparator,
                });

                // Motif ID column
                cols.push({
                    field: "motifID",
                    headerName: "Motif ID",
                    renderCell: (params) => {
                        const id = params.row.motifID;
                        return id ? (
                            <Tooltip title="Open Motif In HOCOMOCO" arrow placement="left">
                                <Link
                                    href={`https://hocomoco12.autosome.org/motif/${id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ color: "#030f98", textDecoration: "none" }}
                                >
                                    {id}
                                </Link>
                            </Tooltip>
                        ) : (
                            "None"
                        );
                    },
                });
            }

            // Overlapping motifs column
            if (sequenceFilterVariables.numOverlappingMotifs) {
                cols.push({
                    field: "numOverlappingMotifs",
                    headerName: "# of Overlapping Motifs",
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
                                        motifs: row.motifs,
                                    })
                                }
                            >
                                {row.numOverlappingMotifs}
                            </button>
                        );
                    },
                });
            }
        }

        return cols;
    }, [sequenceFilterVariables, setModalData]);

    const ToolBarIcon = useMemo(() => {
        return (
            <TableToTop table="sequence" setTableOrder={setTableOrder} />
        )
    }, [setTableOrder])

    return (
        <>
            <Table
                key={Math.random()}
                columns={sequenceColumns}
                rows={isolatedRows ?? sequenceRows}
                loading={loadingRows}
                initialState={{
                    sorting: {
                        sortModel: sequenceFilterVariables.useConservation ? [{ field: "conservationScore", sort: "desc" }] : [{ field: "alt", sort: "desc" }],
                    },
                }}
                divHeight={{ height: loadingRows ? "440px" : "100%", maxHeight: "440px" }}
                label={"Sequence Details"}
                downloadFileName="SequenceRanks.tsv"
                emptyTableFallback={"No Sequence Scores"}
                toolbarSlot={ToolBarIcon}
            />
            {modalData && (
                <MotifsModal
                    key={`${modalData?.chromosome}-${modalData?.start}-${modalData?.end}`}
                    open={modalData?.open || false}
                    setOpen={(isOpen) =>
                        setModalData((prev) => (prev ? { ...prev, open: isOpen } : null))
                    }
                    chromosome={modalData?.chromosome || ""}
                    start={modalData?.start || 0}
                    end={modalData?.end || 0}
                    motifs={modalData?.motifs || []}
                />
            )}
        </>

    )
}

export default SequenceTable