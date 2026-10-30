import { Table, TableColDef } from "@weng-lab/ui-components";
import { GeneTableRow, LinkedGene } from "@/types/rows";
import { GeneLink } from "./cells";
import { formatRegion } from "@/lib/format";
import DetailsModal from "./DetailsModal";

const COLUMNS: TableColDef<LinkedGene>[] = [
    {
        field: "geneName",
        headerName: "Gene Name",
        valueGetter: (_, row) => row.name.trim(),
        renderCell: (params) => <GeneLink name={params.row.name?.trim()} />,
    },
    { field: "geneID", headerName: "Gene ID", valueGetter: (_, row) => row.geneid },
    { field: "linkedBy", headerName: "Linked By", valueGetter: (_, row) => row.linkedBy },
];

/** All genes linked to one region. */
export default function LinkedGenesModal({ row, onClose }: { row: GeneTableRow; onClose: () => void }) {
    return (
        <DetailsModal title={`Linked Genes found in ${formatRegion(row.inputRegion)}`} onClose={onClose}>
            <br />
            <Table
                columns={COLUMNS}
                rows={row.linkedGenes ?? []}
                loading={false}
                initialState={{ sorting: { sortModel: [{ field: "geneName", sort: "desc" }] } }}
                divHeight={{ maxHeight: "600px" }}
                label="Linked Genes"
                emptyTableFallback="No Linked Genes"
            />
        </DetailsModal>
    );
}
