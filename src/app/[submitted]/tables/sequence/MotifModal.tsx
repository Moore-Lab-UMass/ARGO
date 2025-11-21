import { IconButton, Modal, Paper, Tooltip, Typography } from '@mui/material';
import { GridColDef, GridRenderCellParams, Table } from '@weng-lab/ui-components';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

export type MotifProps = {
    referenceAllele: {
        sequence: string;
        score?: number;
    }
    alt: {
        sequence: string;
        score?: number;
    }
    diff: number;
    motifID: string;
}

type MotifsModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chromosome: string;
    start: number;
    end: number;
    motifs: MotifProps[]
};

const MotifsModal: React.FC<MotifsModalProps> = ({
    open,
    setOpen,
    chromosome,
    start: peakStart,
    end: peakEnd,
    motifs,
}) => {

    const MOTIFS_COLS: GridColDef<MotifProps>[] = [
        {
            field: "referenceScore",
            headerName: "Reference Score",
            valueGetter: (_, row) =>
                row.referenceAllele?.score ?? "N/A",
            renderCell: (params: GridRenderCellParams) => {
                const ref = params.row.referenceAllele;
                if (!ref) return "N/A";

                return (
                    <Tooltip
                        title={
                            <span>
                                {ref.sequence && (
                                    <>
                                        <strong>Allele:</strong> {ref.sequence}
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
            },
        },

        {
            field: "alternateScore",
            headerName: "Alternate Score",
            valueGetter: (_, row) =>
                row.alt?.score ?? "N/A",
            renderCell: (params: GridRenderCellParams) => {
                const alt = params.row.alt;
                if (!alt) return "N/A";

                return (
                    <Tooltip
                        title={
                            <span>
                                {alt.sequence && (
                                    <>
                                        <strong>Allele:</strong> {alt.sequence}
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
            },
        },

        {
            field: "delta",
            headerName: "Delta",
            valueGetter: (_, row) =>
                row.diff || row.diff === 0
                    ? row.diff.toFixed(2)
                    : "N/A",
        },

        {
            field: "motifID",
            headerName: "Motif ID",
            valueGetter: (_, row) => row.motifID ?? "None",
            renderCell: (params: GridRenderCellParams) => {
                const id = params.row.motifID;
                if (!id) return "None";

                return (
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
                );
            },
        },
    ];

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        p: 4,
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <Paper sx={style}>
                <IconButton
                    aria-label="close"
                    onClick={() => setOpen(false)}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography variant="h4">
                    Motifs found in {chromosome}:{peakStart.toLocaleString()}-
                    {peakEnd.toLocaleString()}
                </Typography>
                <br />
                <Typography>
                    <b>Reference Allele: </b>{motifs[0].referenceAllele.sequence}
                </Typography>
                <Typography>
                    <b>Alternate Allele: </b>{motifs[0].alt.sequence}
                </Typography>
                <br />
                {motifs && (
                    <Table
                        key={"tfpeaks"}
                        columns={MOTIFS_COLS}
                        rows={motifs}
                        loading={false}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: "delta", sort: "desc" }],
                            },
                        }}
                        divHeight={{ maxHeight: "600px" }}
                        label={"Motifs"}
                        downloadFileName="OverlappingMotifs.tsv"
                        emptyTableFallback={"No Motifs Found"}
                    />
                )}
            </Paper>
        </Modal>
    );
};

export default MotifsModal;