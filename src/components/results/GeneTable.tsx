import { useMemo, useState } from "react";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { RegionID } from "@/types/regions";
import { GeneTableRow } from "@/types/rows";
import { CountButton, GeneScoreCell } from "./cells";
import LinkedGenesModal from "./LinkedGenesModal";
import { regionSelectProps } from "./rowSelection";
import { tableSx, toolbarStyle } from "./tableStyles";

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
    /** Called with a row's region when the row is clicked */
    onSelect: (regionID: RegionID) => void;
};

export default function GeneTable({ rows, isolatedRows, loading, error, onSelect }: GeneTableProps) {
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
                slotProps={{ toolbar: { style: toolbarStyle } }}
                sx={tableSx}
                error={error}
                {...regionSelectProps<GeneTableRow>(onSelect)}
            />
            {linkedGenesRow && <LinkedGenesModal row={linkedGenesRow} onClose={() => setLinkedGenesRow(null)} />}
        </>
    );
}
