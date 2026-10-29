import { useMemo } from "react";
import { Stack } from "@mui/material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { ProportionsBar } from "@weng-lab/visualization";
import { CCRE_CLASSES } from "@/lib/colors";
import { useFilters } from "@/state/filters";
import { Assay, ElementFilterState } from "@/types/filters";
import { RegionID } from "@/types/regions";
import { ElementTableRow } from "@/types/rows";
import { CcreLink } from "./cells";
import { regionSelectProps } from "./rowSelection";
import { tableSx, toolbarStyle } from "./tableStyles";

const CLASS_NAMES: Record<string, string> = { PLS: "Promoter", pELS: "Proximal Enhancer", dELS: "Distal Enhancer" };

const ASSAY_COLUMNS: { key: Assay; label: string }[] = [
    { key: "dnase", label: "DNase" },
    { key: "h3k4me3", label: "H3K4me3" },
    { key: "h3k27ac", label: "H3K27ac" },
    { key: "ctcf", label: "CTCF" },
    { key: "atac", label: "ATAC" },
];

/** cCRE class in its class color ("Promoter" in red, ...). */
function ClassCell({ value }: { value?: string }) {
    if (!value) return null;
    const category = CCRE_CLASSES[value] ?? Object.values(CCRE_CLASSES).find((c) => c.label === value);
    const { label, color } = category ?? { label: "Unknown", color: "black" };
    return <span style={{ color: value === "InActive" ? "gray" : color, fontWeight: "bold" }}>{label}</span>;
}

function elementColumns(f: ElementFilterState): TableColDef<ElementTableRow>[] {
    const cols: TableColDef<ElementTableRow>[] = [
        { field: "regionID", headerName: "Region ID" },
        {
            field: "class",
            headerName: "Class",
            valueGetter: (_, row) => CLASS_NAMES[row.class] ?? row.class,
            renderCell: (params) => <ClassCell value={params.value as string} />,
        },
        {
            field: "accession",
            headerName: "Accession",
            renderCell: ({ row }) => <CcreLink assembly={f.cCREAssembly} accession={row.accession} />,
        },
    ];

    if (f.mustHaveOrtholog && f.cCREAssembly !== "mm10") {
        cols.push({
            field: "ortholog",
            headerName: "Orthologous Accession",
            renderCell: ({ row }) => <CcreLink assembly="mm10" accession={row.ortholog} />,
        });
    }

    for (const { key, label } of ASSAY_COLUMNS) {
        if (!f.assays[key]) continue;
        cols.push({
            field: key,
            headerName: label,
            valueGetter: (_, row) => (typeof row[key] === "number" ? row[key].toFixed(2) : row[key]),
        });
    }
    return cols;
}

type ElementTableProps = {
    rows: ElementTableRow[];
    isolatedRows?: ElementTableRow[];
    loading: boolean;
    error: boolean;
    /** Called with a row's region when the row is clicked */
    onSelect: (regionID: RegionID) => void;
};

export default function ElementTable({ rows, isolatedRows, loading, error, onSelect }: ElementTableProps) {
    const { element: f } = useFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const columns = useMemo(() => elementColumns(f), [f.assays, f.cCREAssembly, f.mustHaveOrtholog]);
    const anyAssay = Object.values(f.assays).some(Boolean);

    const classCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const row of rows) counts[row.class] = (counts[row.class] ?? 0) + 1;
        return counts;
    }, [rows]);

    return (
        <Stack spacing={1}>
            {(rows.length > 0 || loading) && (
                <ProportionsBar
                    data={classCounts}
                    loading={loading}
                    tooltipTitle="cCRE Classification Proportions"
                    getColor={(key) => CCRE_CLASSES[key]?.color ?? "black"}
                    formatLabel={(key) => CCRE_CLASSES[key]?.label ?? key}
                    sortDescending
                    label="cCRE Classification Proportions"
                />
            )}
            <Table
                // remount when the default sort column changes
                key={anyAssay ? "assays" : "no-assays"}
                columns={columns}
                rows={isolatedRows ?? rows}
                initialState={{
                    sorting: { sortModel: anyAssay ? [{ field: "dnase", sort: "desc" }] : [{ field: "regionID", sort: "desc" }] },
                }}
                loading={loading}
                label="Element Details (Overlapping cCREs)"
                divHeight={{ height: "440px", maxHeight: "440px" }}
                emptyTableFallback="No Overlapping cCREs"
                slotProps={{ toolbar: { style: toolbarStyle } }}
                sx={tableSx}
                error={error}
                {...regionSelectProps<ElementTableRow>(onSelect)}
            />
        </Stack>
    );
}
