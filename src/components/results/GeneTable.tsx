import { ReactNode, useMemo, useState } from "react";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { COLORS } from "@/lib/colors";
import { GeneTableRow } from "@/types/rows";
import { CountButton, GeneScoreCell } from "./cells";
import LinkedGenesModal from "./LinkedGenesModal";

function geneColumns(openLinkedGenes: (row: GeneTableRow) => void): TableColDef<GeneTableRow>[] {
    return [
        { field: "regionID", headerName: "Region ID", valueGetter: (_, row) => row.regionID },
        {
            field: "geneExpression",
            headerName: "Gene Expression",
            description: "TPM",
            sortable: true,
            valueGetter: (_, row) => row.geneExpression?.score ?? null,
            renderCell: ({ row }) => <GeneScoreCell value={row.geneExpression} />,
        },
        {
            field: "expressionSpecificity",
            headerName: "Expression Specificity",
            sortable: true,
            valueGetter: (_, row) => row.expressionSpecificity?.score ?? null,
            renderCell: ({ row }) => <GeneScoreCell value={row.expressionSpecificity} />,
        },
        {
            field: "linkedGenes",
            headerName: "# of Linked Genes",
            sortable: true,
            valueGetter: (_, row) => row.linkedGenes?.length ?? 0,
            renderCell: ({ row }) => <CountButton count={row.linkedGenes?.length ?? 0} onClick={() => openLinkedGenes(row)} />,
        },
    ];
}

type GeneTableProps = {
    rows: GeneTableRow[];
    isolatedRows?: GeneTableRow[];
    loading: boolean;
    error: boolean;
    toolbarExtra: ReactNode;
};

export default function GeneTable({ rows, isolatedRows, loading, error, toolbarExtra }: GeneTableProps) {
    const [linkedGenesRow, setLinkedGenesRow] = useState<GeneTableRow | null>(null);
    const columns = useMemo(() => geneColumns(setLinkedGenesRow), []);

    return (
        <>
            <Table
                columns={columns}
                rows={isolatedRows ?? rows}
                loading={loading}
                initialState={{ sorting: { sortModel: [{ field: "geneExpression", sort: "desc" }] } }}
                divHeight={{ height: "440px", maxHeight: "440px" }}
                label="Gene Details"
                emptyTableFallback="No Linked Genes"
                slotProps={{ toolbar: { extra: toolbarExtra, style: { backgroundColor: COLORS.toolbar } } }}
                error={error}
            />
            {linkedGenesRow && <LinkedGenesModal row={linkedGenesRow} onClose={() => setLinkedGenesRow(null)} />}
        </>
    );
}
