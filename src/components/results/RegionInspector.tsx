import { ReactNode, useState } from "react";
import { Box, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MONO_FONT, RADIUS } from "@/app/theme";
import { BRAND, CATEGORY_COLORS, CCRE_CLASSES, RankCategory } from "@/lib/colors";
import { CONSERVATION_TRACKS, LINKAGE_METHOD_OPTIONS } from "@/lib/constants";
import { useFilters } from "@/state/filters";
import { Assay } from "@/types/filters";
import { InputRegion } from "@/types/regions";
import { ElementTableRow, GeneScore, GeneTableRow, MainTableRow, SequenceTableRow } from "@/types/rows";
import { CcreLink, GeneLink, MotifLink } from "./cells";

const ASSAY_LABELS: { key: Assay; label: string }[] = [
    { key: "dnase", label: "DNase" },
    { key: "h3k4me3", label: "H3K4me3" },
    { key: "h3k27ac", label: "H3K27ac" },
    { key: "ctcf", label: "CTCF" },
    { key: "atac", label: "ATAC" },
];

/**
 * Z-scores have no upper bound, so they're shown against ENCODE's cutoff for a high signal
 * (Z > 1.64, the 95th percentile), the same cutoff used to classify cCREs.
 */
const HIGH_Z_SCORE = 1.64;

/** No conservation score: buildSequenceRows uses this value so these regions rank last. */
const NO_SCORE = -1_000_000;

/** Linked genes listed before "+N more" */
const MAX_GENES = 8;

/** Panel width in px on medium screens and up */
export const INSPECTOR_WIDTH = 340;

const fmt = (v?: number) => (typeof v === "number" && v !== NO_SCORE ? v.toFixed(2) : "N/A");
const linkLabel = (method: string) => LINKAGE_METHOD_OPTIONS.find((o) => o.value === method)?.label ?? method;

type RegionInspectorProps = {
    region: InputRegion;
    mainRow?: MainTableRow;
    sequence?: SequenceTableRow;
    elements: ElementTableRow[];
    gene?: GeneTableRow;
    enabled: Record<RankCategory, boolean>;
    onClose: () => void;
};

/** Side panel with everything known about the selected region. */
export default function RegionInspector({ region, mainRow, sequence, elements, gene, enabled, onClose }: RegionInspectorProps) {
    const change = region.ref || region.alt ? `${region.ref} → ${region.alt}` : "";

    return (
        <Box
            component="aside"
            aria-label="Selected region"
            sx={{
                backgroundColor: BRAND.paper,
                border: `1px solid ${BRAND.border}`,
                borderRadius: `${RADIUS}px`,
                boxShadow: "0 4px 16px rgba(16,24,40,0.08)",
                overflow: "hidden",
            }}
        >
            {/* Label + close on the first row, region ID + aggregate rank on the second, location full width below */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1fr) auto",
                    alignItems: "center",
                    columnGap: 1.5,
                    p: "16px 18px",
                    backgroundColor: BRAND.sidebar,
                    color: "#ffffff",
                }}
            >
                <Typography sx={{ gridArea: "1 / 1", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: BRAND.onNavyMuted }}>
                    Selected region
                </Typography>
                <IconButton
                    aria-label="Clear selection"
                    onClick={onClose}
                    size="small"
                    sx={{ gridArea: "1 / 2", justifySelf: "end", color: "#ffffff", my: -0.75, mr: -1 }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                <Typography component="h2" sx={{ gridArea: "2 / 1", mt: 0.5, fontSize: 20, fontWeight: 700, wordBreak: "break-word" }}>
                    {region.regionID}
                </Typography>
                {!!mainRow?.aggregateRank && (
                    <Tooltip title="Aggregate rank">
                        <Typography sx={{ gridArea: "2 / 2", justifySelf: "end", mt: 0.5, fontSize: 26, fontWeight: 700, lineHeight: 1 }}>
                            #{mainRow.aggregateRank}
                        </Typography>
                    </Tooltip>
                )}
                <Typography sx={{ gridArea: "3 / 1 / 4 / 3", mt: 0.5, fontFamily: MONO_FONT, fontSize: 12, color: "#dfe6f6" }}>
                    {region.chr}:{region.start}-{region.end}
                    {change && (
                        <>
                            {" "}
                            <Box component="span" sx={{ whiteSpace: "nowrap" }}>
                                · {change}
                            </Box>
                        </>
                    )}
                </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", borderBottom: `1px solid ${BRAND.divider}` }}>
                {(["sequence", "element", "gene"] as const).map((cat, i) => {
                    const rank = mainRow?.[`${cat}Rank`];
                    return (
                        <Box key={cat} sx={{ p: 1.5, textAlign: "center", borderLeft: i > 0 ? `1px solid ${BRAND.divider}` : undefined }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 600, color: BRAND.muted }}>{CATEGORY_COLORS[cat].label}</Typography>
                            <Typography sx={{ mt: 0.25, fontSize: 18, fontWeight: 700, color: rank ? CATEGORY_COLORS[cat].pillText : BRAND.muted }}>
                                {enabled[cat] && rank ? rank : "–"}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>

            {enabled.sequence && <SequenceSection row={sequence} />}
            {enabled.element && <ElementSection rows={elements} />}
            {enabled.gene && <GeneSection row={gene} />}
        </Box>
    );
}

function Section({ category, title, extra, children, last }: { category: RankCategory; title?: string; extra?: ReactNode; children: ReactNode; last?: boolean }) {
    return (
        <Stack gap={1} sx={{ p: "14px 18px", borderBottom: last ? undefined : `1px solid ${BRAND.divider}` }}>
            <Typography component="h3" sx={{ fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: "2px", backgroundColor: CATEGORY_COLORS[category].main }} />
                {title ?? CATEGORY_COLORS[category].label}
                {extra}
            </Typography>
            {children}
        </Stack>
    );
}

const Empty = ({ children }: { children: ReactNode }) => <Typography sx={{ fontSize: 13, color: BRAND.muted }}>{children}</Typography>;

/** Label/value pairs in two columns. */
function Facts({ items }: { items: [string, ReactNode][] }) {
    return (
        <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: "6px 12px", fontSize: 13 }}>
            {items.map(([label, value]) => (
                <Box key={label} sx={{ display: "contents" }}>
                    <Box component="dt" sx={{ color: BRAND.muted }}>
                        {label}
                    </Box>
                    <Box component="dd" sx={{ m: 0, fontFamily: MONO_FONT, fontSize: 12, textAlign: "right" }}>
                        {value}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

function SequenceSection({ row }: { row?: SequenceTableRow }) {
    const { sequence: f } = useFilters();
    if (!row) {
        return (
            <Section category="sequence">
                <Empty>No sequence scores</Empty>
            </Section>
        );
    }
    const items: [string, ReactNode][] = [];
    if (f.useConservation) {
        items.push([
            "Conservation",
            <Tooltip key="conservation" title={CONSERVATION_TRACKS[f.alignment].menuLabel}>
                <span>{fmt(row.conservationScore)}</span>
            </Tooltip>,
        ]);
    }
    if (f.useMotifs) {
        items.push(["Motif score Δ", fmt(row.motifScoreDelta)]);
        if (f.numOverlappingMotifs) items.push(["Overlapping motifs", row.numOverlappingMotifs ?? 0]);
        items.push(["Top motif", <MotifLink key="motif" id={row.motifID} />]);
    }
    return (
        <Section category="sequence">
            <Facts items={items} />
        </Section>
    );
}

function ElementSection({ rows }: { rows: ElementTableRow[] }) {
    const { element: f } = useFilters();
    const [picked, setPicked] = useState(0);
    const row = rows[Math.min(picked, rows.length - 1)];

    if (!row) {
        return (
            <Section category="element">
                <Empty>No overlapping cCREs</Empty>
            </Section>
        );
    }

    const ccreClass = CCRE_CLASSES[row.class];
    const assays = ASSAY_LABELS.filter((a) => f.assays[a.key]);

    return (
        <Section
            category="element"
            extra={
                <Box component="span" sx={{ fontWeight: 400, color: BRAND.muted, fontFamily: MONO_FONT, fontSize: 12 }}>
                    · <CcreLink assembly={f.cCREAssembly} accession={row.accession} />
                </Box>
            }
        >
            {rows.length > 1 && (
                <Stack direction="row" flexWrap="wrap" gap={0.5} role="group" aria-label="Overlapping cCREs">
                    {rows.map((r, i) => (
                        <Chip
                            key={r.accession}
                            label={r.accession}
                            size="small"
                            clickable
                            aria-pressed={r === row}
                            onClick={() => setPicked(i)}
                            variant={r === row ? "filled" : "outlined"}
                            sx={{ fontFamily: MONO_FONT, fontSize: 11 }}
                        />
                    ))}
                </Stack>
            )}
            <Typography sx={{ fontSize: 13, display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: "4px", backgroundColor: ccreClass?.color ?? BRAND.muted }} />
                {ccreClass?.label ?? row.class}
            </Typography>
            {assays.length > 0 && (
                <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto 40px", alignItems: "center", gap: "6px 12px", fontSize: 13 }}>
                    {assays.map(({ key, label }) => (
                        <Box key={key} sx={{ display: "contents" }}>
                            <Box component="dt" sx={{ color: BRAND.muted }}>
                                {label}
                            </Box>
                            <Box component="dd" sx={{ m: 0, fontFamily: MONO_FONT, fontSize: 12, textAlign: "right" }}>
                                {fmt(row[key])}
                            </Box>
                            <Box component="dd" sx={{ m: 0 }}>
                                <SignalTag z={row[key]} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            )}
            {assays.length > 0 && (
                <Typography sx={{ fontSize: 11, color: BRAND.muted }}>Z-scores. High means above {HIGH_Z_SCORE}, the top 5% of signal.</Typography>
            )}
        </Section>
    );
}

/** "High" or "Low" against ENCODE's high-signal cutoff; nothing when there's no score. */
function SignalTag({ z }: { z?: number }) {
    if (typeof z !== "number") return null;
    const high = z > HIGH_Z_SCORE;
    return (
        <Box
            component="span"
            sx={{
                display: "block",
                textAlign: "center",
                py: "1px",
                borderRadius: "4px",
                fontSize: 11,
                fontWeight: 600,
                backgroundColor: high ? CATEGORY_COLORS.element.pillBg : BRAND.track,
                color: high ? CATEGORY_COLORS.element.pillText : BRAND.muted,
            }}
        >
            {high ? "High" : "Low"}
        </Box>
    );
}

function GeneSection({ row }: { row?: GeneTableRow }) {
    if (!row) {
        return (
            <Section category="gene" title="Linked genes" last>
                <Empty>No linked genes</Empty>
            </Section>
        );
    }

    const score = (s?: GeneScore) =>
        s ? (
            <>
                {s.score.toFixed(2)}
                {s.geneName !== "Average" && <> · <GeneLink name={s.geneName} /></>}
            </>
        ) : (
            "N/A"
        );

    // A gene can be linked through more than one cCRE; list each once
    const genes = [...new Map((row.linkedGenes ?? []).map((g) => [g.name, g])).values()];

    return (
        <Section category="gene" title="Linked genes" last>
            <Facts
                items={[
                    ["Expression (TPM)", score(row.geneExpression)],
                    ["Specificity", score(row.expressionSpecificity)],
                ]}
            />
            {genes.length > 0 && (
                <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: 13, mt: 0.5 }}>
                    <thead>
                        <Box component="tr" sx={{ color: BRAND.muted, fontSize: 11, textAlign: "left" }}>
                            <Box component="th" sx={{ py: 0.5, fontWeight: 600 }}>
                                Gene
                            </Box>
                            <Box component="th" sx={{ py: 0.5, fontWeight: 600, textAlign: "right" }}>
                                Linked by
                            </Box>
                        </Box>
                    </thead>
                    <tbody>
                        {genes.slice(0, MAX_GENES).map((g) => (
                            <Box component="tr" key={g.name} sx={{ borderTop: `1px solid ${BRAND.divider}` }}>
                                <Box component="td" sx={{ py: 0.75, fontFamily: MONO_FONT, fontSize: 12 }}>
                                    <GeneLink name={g.name} />
                                </Box>
                                <Box component="td" sx={{ py: 0.75, textAlign: "right", color: BRAND.muted, fontSize: 12 }}>
                                    {linkLabel(g.linkedBy)}
                                </Box>
                            </Box>
                        ))}
                    </tbody>
                </Box>
            )}
            {genes.length > MAX_GENES && <Empty>+{genes.length - MAX_GENES} more in the Genes table</Empty>}
        </Section>
    );
}
