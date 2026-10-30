"use client";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { Box, ButtonBase, Divider, IconButton, Stack, Tooltip } from "@mui/material";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import CompassCollection from "@/components/compass/CompassCollection";
import { useCategoryRows } from "@/hooks/useCategoryRows";
import { BRAND, CATEGORY_COLORS, RankCategory } from "@/lib/colors";
import { rankRegions } from "@/lib/ranking/pipeline";
import { useFilters } from "@/state/filters";
import { InputRegion, RegionID } from "@/types/regions";
import ElementTable from "./ElementTable";
import GeneTable from "./GeneTable";
import MainTable from "./MainTable";
import RegionInspector, { INSPECTOR_WIDTH } from "./RegionInspector";
import SequenceTable from "./SequenceTable";
import { cardSx } from "./tableStyles";

const DETAIL_TABLES: RankCategory[] = ["sequence", "element", "gene"];

/** Space between the tables and the inspector, in px */
const INSPECTOR_GAP = 20;

/** Keeps only rows for the selected region (or undefined when nothing is selected). */
function isolate<T extends { regionID: RegionID }>(rows: T[], selected: RegionID | null): T[] | undefined {
    return selected === null ? undefined : rows.filter((row) => row.regionID === selected);
}

/**
 * The ranked regions table, the sequence / element / gene detail tables (as tabs, or all three stacked),
 * and the inspector for the selected region. All data for the page is fetched here, once.
 */
export default function ResultsTables({ regions }: { regions: InputRegion[] }) {
    const filters = useFilters();
    const { rows, loading, errors } = useCategoryRows(regions, filters);
    const { mainRows } = useMemo(() => rankRegions(regions, rows, filters), [regions, rows, filters]);

    const [selected, setSelected] = useState<RegionID | null>(null);
    // The region the inspector shows. It outlives the selection so the panel keeps its content while sliding closed.
    const [shown, setShown] = useState<RegionID | null>(null);
    const select = useCallback((id: RegionID | null) => {
        setSelected(id);
        if (id !== null) setShown(id);
    }, []);
    const [tab, setTab] = useState<RankCategory>("sequence");
    const [showAll, setShowAll] = useState(false);

    // Memoized so the detail tables only get new props when their data or the selection changes
    const isolated = useMemo(
        () => ({
            sequence: isolate(rows.sequence, selected),
            element: isolate(rows.element, selected),
            gene: isolate(rows.gene, selected),
        }),
        [rows, selected]
    );

    const enabled: Record<RankCategory, boolean> = {
        sequence: filters.sequence.useConservation || filters.sequence.useMotifs,
        element: filters.element.usecCREs,
        gene: filters.gene.useGenes,
    };
    const enabledTables = DETAIL_TABLES.filter((t) => enabled[t]);
    // If the open tab's category was switched off, show the first one still on
    const activeTab = enabled[tab] ? tab : enabledTables[0];

    const open = selected !== null;
    const shownRegion = shown === null ? undefined : regions.find((r) => r.regionID === shown);
    const shownElements = useMemo(() => isolate(rows.element, shown) ?? [], [rows.element, shown]);

    // Clicking a detail row opens its region in the inspector
    const renderTable = (table: RankCategory): ReactNode => {
        switch (table) {
            case "sequence":
                return (
                    <SequenceTable
                        rows={rows.sequence}
                        isolatedRows={isolated.sequence}
                        loading={loading.sequence}
                        error={!!errors.sequence}
                        onSelect={select}
                    />
                );
            case "element":
                return (
                    <ElementTable
                        rows={rows.element}
                        isolatedRows={isolated.element}
                        loading={loading.element}
                        error={!!errors.element}
                        onSelect={select}
                    />
                );
            case "gene":
                return (
                    <GeneTable rows={rows.gene} isolatedRows={isolated.gene} loading={loading.gene} error={!!errors.gene} onSelect={select} />
                );
        }
    };

    return (
        <>
            <Stack direction={{ xs: "column", md: "row" }} alignItems={{ xs: "stretch", md: "flex-start" }}>
                <Stack gap={2.5} sx={{ flex: "1 1 0", minWidth: 0 }}>
                    <MainTable rows={mainRows} loading={loading.any} selected={selected} onSelect={select} />

                    {enabledTables.length > 0 && (
                        <Box component="section" aria-label="Detail tables" sx={cardSx}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} sx={{ p: "12px 14px" }}>
                                {showAll ? (
                                    <Box component="h2" sx={{ m: 0, fontSize: 15, fontWeight: 600 }}>
                                        Detail tables
                                    </Box>
                                ) : (
                                    <DetailTabs tables={enabledTables} active={activeTab} onChange={setTab} />
                                )}
                                <Tooltip title={showAll ? "Show one table at a time" : "Show all tables"}>
                                    <IconButton
                                        onClick={() => setShowAll((prev) => !prev)}
                                        aria-label={showAll ? "Show one table at a time" : "Show all tables"}
                                        aria-pressed={showAll}
                                        sx={{ border: `1px solid ${BRAND.border}`, borderRadius: "8px" }}
                                        size="small"
                                    >
                                        {showAll ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                            {showAll ? (
                                enabledTables.map((table, i) => (
                                    <Box key={table}>
                                        {i > 0 && <Divider sx={{ borderColor: BRAND.border, borderBottomWidth: 2 }} />}
                                        <Box sx={{ px: 2, py: 1.5 }}>{renderTable(table)}</Box>
                                    </Box>
                                ))
                            ) : (
                                <Box role="tabpanel" id={`detail-panel-${activeTab}`} aria-labelledby={`detail-tab-${activeTab}`} sx={{ px: 2, pb: 1.5 }}>
                                    {renderTable(activeTab)}
                                </Box>
                            )}
                        </Box>
                    )}
                </Stack>

                {/* On medium screens and up the panel slides in from the right and the tables narrow to make room.
                    Below that it sits under the tables. */}
                <Box
                    inert={!open}
                    sx={{
                        flexShrink: 0,
                        display: { xs: open ? "block" : "none", md: "flex" },
                        justifyContent: "flex-end",
                        width: { md: open ? INSPECTOR_WIDTH + INSPECTOR_GAP : 0 },
                        overflow: "hidden",
                        position: { md: "sticky" },
                        top: 16,
                        transition: (theme) => theme.transitions.create("width", { duration: 300, easing: theme.transitions.easing.easeInOut }),
                        "@media (prefers-reduced-motion: reduce)": { transition: "none" },
                    }}
                >
                    {shownRegion && (
                        <Box sx={{ flexShrink: 0, width: { md: INSPECTOR_WIDTH }, ml: { md: `${INSPECTOR_GAP}px` }, mt: { xs: 2.5, md: 0 } }}>
                            <RegionInspector
                                key={shownRegion.regionID}
                                region={shownRegion}
                                mainRow={mainRows.find((r) => r.regionID === shown)}
                                sequence={rows.sequence.find((r) => r.regionID === shown)}
                                elements={shownElements}
                                gene={rows.gene.find((r) => r.regionID === shown)}
                                enabled={enabled}
                                onClose={() => select(null)}
                            />
                        </Box>
                    )}
                </Box>
            </Stack>
            <CompassCollection pageRegions={regions} pageRows={rows} loadingPage={loading.any} />
        </>
    );
}

/** Segmented Sequence / Elements / Genes switcher for the detail tables. */
function DetailTabs({ tables, active, onChange }: { tables: RankCategory[]; active: RankCategory; onChange: (t: RankCategory) => void }) {
    return (
        <Box
            role="tablist"
            aria-label="Detail tables"
            sx={{
                display: "inline-grid",
                gridTemplateColumns: `repeat(${tables.length}, minmax(0, 1fr))`,
                gap: "3px",
                p: "3px",
                borderRadius: "10px",
                backgroundColor: BRAND.track,
            }}
        >
            {tables.map((t) => {
                const selected = t === active;
                return (
                    <ButtonBase
                        key={t}
                        role="tab"
                        id={`detail-tab-${t}`}
                        aria-selected={selected}
                        aria-controls={`detail-panel-${t}`}
                        onClick={() => onChange(t)}
                        sx={{
                            gap: 1,
                            px: 2,
                            py: 0.875,
                            borderRadius: "7px",
                            fontSize: 13,
                            fontWeight: selected ? 600 : 500,
                            color: selected ? BRAND.text : BRAND.muted,
                            backgroundColor: selected ? BRAND.raised : "transparent",
                            boxShadow: selected ? "0 1px 2px rgba(16,24,40,0.12)" : "none",
                        }}
                    >
                        <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: CATEGORY_COLORS[t].main }} />
                        {CATEGORY_COLORS[t].label}
                    </ButtonBase>
                );
            })}
        </Box>
    );
}
