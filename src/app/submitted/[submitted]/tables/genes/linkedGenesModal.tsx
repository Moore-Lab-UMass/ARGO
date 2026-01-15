import { Typography, Modal, Paper, IconButton, Tooltip, Link } from "@mui/material";
import { GridColDef, GridRenderCellParams, Table } from "@weng-lab/ui-components";
import CloseIcon from '@mui/icons-material/Close';
import { GeneLinkingMethod } from "../../../../types";

type LinkedGenes = {
    accession: string
    name: string
    geneid: string
    linkedBy: GeneLinkingMethod
};

type GeneModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chromosome: string;
    start: number;
    end: number;
    genes: LinkedGenes[];
};

const GenesModal: React.FC<GeneModalProps> = ({
    open,
    setOpen,
    chromosome,
    start,
    end,
    genes,
}) => {

    const GENE_COLS: GridColDef<LinkedGenes>[] = [
        {
            field: "geneName",
            headerName: "Gene Name",
            valueGetter: (_, row) => row.name.trim(),
            renderCell: (params: GridRenderCellParams) => {
                const name = params.row.name?.trim();
                return (
                    <Tooltip title={"Open gene in SCREEN"} arrow placement={"right"}>
                        <Link
                            href={`https://screen.wenglab.org/GRCh38/gene/${name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="none"
                        >
                            {name}
                        </Link>
                    </Tooltip>
                );
            },
        },

        {
            field: "geneID",
            headerName: "Gene ID",
            valueGetter: (_, row) => row.geneid,
        },

        {
            field: "linkedBy",
            headerName: "Linked By",
            valueGetter: (_, row) => row.linkedBy,
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
                    Linked Genes found in {chromosome}:{start.toLocaleString()}-
                    {end.toLocaleString()}
                </Typography>
                <br />
                <br />
                {genes && (
                    <Table
                        key={"linkedGenes"}
                        columns={GENE_COLS}
                        rows={genes}
                        loading={false}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: "geneName", sort: "desc" }],
                            },
                        }}
                        divHeight={{ maxHeight: "600px" }}
                        label={"Linked Genes"}
                        downloadFileName="LinkedGenes.tsv"
                        emptyTableFallback={"No Linked Genes"}
                    />
                )}
            </Paper>
        </Modal>
    );
};

export default GenesModal;