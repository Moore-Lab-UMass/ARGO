import { useMemo, useState } from "react";
import { Grid, Stack } from "@mui/material";
import { Table, TableColDef } from "@weng-lab/ui-components";
import { ProportionsBar } from "@weng-lab/visualization";
import { Category, MOTIF_DATA_SOURCES, MOTIF_QUALITIES } from "@/lib/colors";
import { CONSERVATION_TRACKS } from "@/lib/constants";
import { useFilters } from "@/state/filters";
import { SequenceFilterState } from "@/types/filters";
import { RegionID } from "@/types/regions";
import { SequenceTableRow } from "@/types/rows";
import { missingLastComparator } from "@/lib/sort";
import { AlleleScore, AlleleSequence, CountButton, MotifLink } from "./cells";
import MotifModal from "./MotifModal";
import { regionSelectProps } from "./rowSelection";
import { tableSx, toolbarStyle } from "./tableStyles";

const naLast = missingLastComparator((v) => v === "N/A" || v == null);

/** No conservation score: buildSequenceRows uses this value so these regions rank last. */
const NO_SCORE = -1_000_000;

function sequenceColumns(f: SequenceFilterState, openMotifs: (row: SequenceTableRow) => void): TableColDef<SequenceTableRow>[] {
    const cols: TableColDef<SequenceTableRow>[] = [{ field: "regionID", headerName: "Region ID" }];

    if (f.useConservation) {
        cols.push({
            field: "conservationScore",
            headerName: `${CONSERVATION_TRACKS[f.alignment].columnLabel} Score`,
            renderCell: ({ row }) => {
                const v = row.conservationScore;
                return v === NO_SCORE || typeof v !== "number" ? "N/A" : v.toFixed(2);
            },
            sortComparator: naLast,
        });
    }

    if (f.useMotifs) {
        const showScore = f.motifScoreDelta;
        cols.push(
            {
                field: "referenceAllele",
                headerName: showScore ? "Reference Score" : "Reference",
                sortComparator: naLast,
                renderCell: ({ row }) =>
                    showScore ? <AlleleScore allele={row.referenceAllele} shorten /> : <AlleleSequence allele={row.referenceAllele} />,
            },
            {
                field: "alt",
                headerName: showScore ? "Alternate Score" : "Alternate",
                sortComparator: naLast,
                renderCell: ({ row }) => (showScore ? <AlleleScore allele={row.alt} shorten /> : <AlleleSequence allele={row.alt} />),
            }
        );
        if (showScore) {
            cols.push(
                {
                    field: "motifScoreDelta",
                    headerName: "Delta",
                    renderCell: ({ row }) => {
                        const v = row.motifScoreDelta;
                        return v || v === 0 ? v.toFixed(2) : "N/A";
                    },
                    sortComparator: naLast,
                },
                { field: "motifID", headerName: "Motif ID", renderCell: ({ row }) => <MotifLink id={row.motifID} /> }
            );
        }
        if (f.numOverlappingMotifs) {
            cols.push({
                field: "numOverlappingMotifs",
                headerName: "# of Overlapping Motifs",
                renderCell: ({ row }) => <CountButton count={row.numOverlappingMotifs} onClick={() => openMotifs(row)} />,
            });
        }
    }
    return cols;
}

/** Counts how often each category appears, e.g. motif qualities across rows. */
function countBy(rows: SequenceTableRow[], categoriesOf: (motifID: string) => string[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const row of rows) {
        const categories = row.motifID ? categoriesOf(row.motifID) : [];
        for (const c of categories.length > 0 ? categories : ["none"]) counts[c] = (counts[c] ?? 0) + 1;
    }
    return counts;
}

const colorOf = (map: Record<string, Category>) => (key: string) => map[key]?.color ?? "grey";
const labelOf = (map: Record<string, Category>) => (key: string) => (map[key] ? `${map[key].label} (${key})` : key);

type SequenceTableProps = {
    rows: SequenceTableRow[];
    /** Rows to show instead of `rows` while some regions are isolated in the main table */
    isolatedRows?: SequenceTableRow[];
    loading: boolean;
    error: boolean;
    /** Called with a row's region when the row is clicked */
    onSelect: (regionID: RegionID) => void;
};

export default function SequenceTable({ rows, isolatedRows, loading, error, onSelect }: SequenceTableProps) {
    const { sequence: f } = useFilters();
    const [motifRow, setMotifRow] = useState<SequenceTableRow | null>(null);

    const columns = useMemo(
        () => sequenceColumns(f, setMotifRow),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [f.useConservation, f.alignment, f.useMotifs, f.motifScoreDelta, f.numOverlappingMotifs]
    );

    // Motif IDs look like NAME.H14CORE.0.PSM.A: data source letters are the 4th part, quality the last
    const qualityCounts = useMemo(() => countBy(rows, (id) => [id.split(".").pop()].filter(Boolean)), [rows]);
    const dataSourceCounts = useMemo(() => countBy(rows, (id) => (id.split(".")[3] ?? "").split("")), [rows]);

    return (
        <Stack spacing={1}>
            {(rows.length > 0 || loading) && (
                <Grid container spacing={2}>
                    <Grid size={6}>
                        <ProportionsBar
                            data={qualityCounts}
                            loading={loading}
                            tooltipTitle="Motif Quality Proportions"
                            getColor={colorOf(MOTIF_QUALITIES)}
                            formatLabel={labelOf(MOTIF_QUALITIES)}
                            sortDescending
                            label="Motif Quality Proportions"
                        />
                    </Grid>
                    <Grid size={6}>
                        <ProportionsBar
                            data={dataSourceCounts}
                            loading={loading}
                            tooltipTitle="Data Source Proportions"
                            getColor={colorOf(MOTIF_DATA_SOURCES)}
                            formatLabel={labelOf(MOTIF_DATA_SOURCES)}
                            sortDescending
                            label="Data Source Proportions"
                        />
                    </Grid>
                </Grid>
            )}
            <Table
                // remount when the default sort column changes
                key={f.useConservation ? "conservation" : "motifs"}
                columns={columns}
                rows={isolatedRows ?? rows}
                loading={loading}
                initialState={{
                    sorting: {
                        sortModel: f.useConservation ? [{ field: "conservationScore", sort: "desc" }] : [{ field: "alt", sort: "desc" }],
                    },
                }}
                divHeight={{ height: "440px", maxHeight: "440px" }}
                label="Sequence Details"
                emptyTableFallback="No Sequence Scores"
                slotProps={{ toolbar: { style: toolbarStyle } }}
                sx={tableSx}
                error={error}
                {...regionSelectProps<SequenceTableRow>(onSelect)}
            />
            {motifRow && <MotifModal row={motifRow} onClose={() => setMotifRow(null)} />}
        </Stack>
    );
}
