import { Typography } from "@mui/material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { MotifHit, SequenceTableRow } from "@/types/rows";
import { AlleleScore, MotifLink } from "./cells";
import DetailsModal, { formatRegion } from "./DetailsModal";

const COLUMNS: TableColDef<MotifHit>[] = [
    {
        field: "referenceScore",
        headerName: "Reference Score",
        valueGetter: (_, row) => row.referenceAllele?.score ?? "N/A",
        renderCell: (params) => <AlleleScore allele={params.row.referenceAllele} />,
    },
    {
        field: "alternateScore",
        headerName: "Alternate Score",
        valueGetter: (_, row) => row.alt?.score ?? "N/A",
        renderCell: (params) => <AlleleScore allele={params.row.alt} />,
    },
    {
        field: "delta",
        headerName: "Delta",
        valueGetter: (_, row) => (row.diff || row.diff === 0 ? row.diff.toFixed(2) : "N/A"),
    },
    {
        field: "motifID",
        headerName: "Motif ID",
        valueGetter: (_, row) => row.motifID ?? "None",
        renderCell: (params) => <MotifLink id={params.row.motifID} />,
    },
];

/** All motifs overlapping one region. */
export default function MotifModal({ row, onClose }: { row: SequenceTableRow; onClose: () => void }) {
    return (
        <DetailsModal title={`Motifs found in ${formatRegion(row.inputRegion)}`} onClose={onClose}>
            <Typography>
                <b>Reference Allele: </b>
                {row.referenceAllele?.sequence}
            </Typography>
            <Typography>
                <b>Alternate Allele: </b>
                {row.alt?.sequence}
            </Typography>
            <br />
            <Table
                columns={COLUMNS}
                rows={row.motifs ?? []}
                loading={false}
                initialState={{ sorting: { sortModel: [{ field: "delta", sort: "desc" }] } }}
                divHeight={{ maxHeight: "600px" }}
                label="Motifs"
                emptyTableFallback="No Motifs Found"
            />
        </DetailsModal>
    );
}
