import { useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Select, Stack, ThemeProvider, Typography } from "@mui/material";
import theme from "@/app/theme";
import BiotechIcon from "@mui/icons-material/Biotech";
import { LINKAGE_METHOD_OPTIONS } from "@/lib/constants";
import { useFilterActions, useFilters } from "@/state/filters";
import { GeneFilterState, GeneLinkingMethod } from "@/types/filters";
import BiosampleChip, { biosampleLabel } from "./BiosampleChip";
import { BiosampleModal } from "./BiosampleModal";
import FilterAccordion from "./FilterAccordion";
import SegmentedControl from "./SegmentedControl";
import { LinkageBiosampleModal } from "./LinkageBiosampleModal";

type Props = { expanded: boolean; onToggle: () => void };

const MAX_OR_AVERAGE: { value: "max" | "avg"; label: string }[] = [
    { value: "max", label: "Max" },
    { value: "avg", label: "Avg" },
];

/** e.g. "Distance · max expression · most linked" */
function summarize(f: GeneFilterState): string {
    const method = LINKAGE_METHOD_OPTIONS.find((o) => o.value === f.methodOfLinkage)?.label ?? f.methodOfLinkage;
    return [method, `${f.rankGeneExpBy} expression`, `${f.rankLinkedBy} linked`].join(" · ");
}

/**
 * Linking a gene by anything other than distance needs a biosample. Picking such a method
 * opens the linkage dialog; the method only takes effect once a biosample is submitted,
 * and cancelling falls back to distance.
 */
export default function GeneFilters({ expanded, onToggle }: Props) {
    const { gene: f } = useFilters();
    const { setGene, dispatch } = useFilterActions();
    const [expressionBiosampleOpen, setExpressionBiosampleOpen] = useState(false);
    // Linkage dialog: `fromMenu` is true when opened by choosing a new method (cancel reverts to distance)
    const [linkageDialog, setLinkageDialog] = useState<{ method: GeneLinkingMethod; fromMenu: boolean } | null>(null);
    const disabled = !f.useGenes;

    const handleMethodChange = (method: GeneLinkingMethod) => {
        if (method === "distance") dispatch({ type: "clearLinkage" });
        else setLinkageDialog({ method, fromMenu: true });
    };

    const handleLinkageCancel = () => {
        if (linkageDialog?.fromMenu) dispatch({ type: "clearLinkage" });
        setLinkageDialog(null);
    };

    return (
        <FilterAccordion
            category="gene"
            info="Filter results based on linked genes and their linking method"
            enabled={f.useGenes}
            onEnabledChange={(on) => setGene("useGenes", on)}
            summary={summarize(f)}
            expanded={expanded}
            onToggle={onToggle}
        >
            <Stack gap={1.5}>
                <FormControl fullWidth disabled={disabled}>
                    <Typography sx={{ fontSize: 12, color: disabled ? "text.disabled" : "text.secondary", mb: 0.75 }}>
                        Linking method
                    </Typography>
                    <Select
                        value={f.methodOfLinkage}
                        onChange={(e) => handleMethodChange(e.target.value as GeneLinkingMethod)}
                        size="small"
                    >
                        {LINKAGE_METHOD_OPTIONS.map((o) => (
                            <MenuItem key={o.value} value={o.value}>
                                {o.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {f.linkageBiosample && (
                    <BiosampleChip
                        label={f.methodOfLinkage === "eQTLs" ? f.linkageBiosample.displayname : biosampleLabel(f.linkageBiosample)}
                        onClick={() => setLinkageDialog({ method: f.methodOfLinkage, fromMenu: false })}
                        onClear={() => dispatch({ type: "clearLinkage" })}
                    />
                )}
                <SegmentedControl
                    label="Rank gene expression by"
                    value={f.rankGeneExpBy}
                    options={MAX_OR_AVERAGE}
                    onChange={(v) => setGene("rankGeneExpBy", v)}
                    disabled={disabled}
                />
                <Button
                    size="small"
                    startIcon={<BiotechIcon />}
                    onClick={() => setExpressionBiosampleOpen(true)}
                    disabled={disabled}
                    sx={{ width: "fit-content" }}
                    variant="outlined"
                >
                    Gene expression biosample
                </Button>
                {f.selectedBiosample && (
                    <BiosampleChip label={biosampleLabel(f.selectedBiosample)} onClear={() => setGene("selectedBiosample", null)} />
                )}
                <SegmentedControl
                    label="Rank expression specificity by"
                    value={f.rankExpSpecBy}
                    options={MAX_OR_AVERAGE}
                    onChange={(v) => setGene("rankExpSpecBy", v)}
                    disabled={disabled}
                />
                <SegmentedControl
                    label="Rank # of linked genes by"
                    value={f.rankLinkedBy}
                    options={[
                        { value: "most", label: "Most" },
                        { value: "least", label: "Least" },
                    ]}
                    onChange={(v) => setGene("rankLinkedBy", v)}
                    disabled={disabled}
                />
                <FormControl disabled={disabled}>
                    <Typography sx={{ fontSize: 12, color: disabled ? "text.disabled" : "text.secondary" }}>Gene filters</Typography>
                    <FormGroup>
                        <FormControlLabel
                            label="Must be protein coding"
                            control={<Checkbox />}
                            checked={f.mustBeProteinCoding}
                            onChange={(_, checked) => setGene("mustBeProteinCoding", checked)}
                        />
                        <FormControlLabel
                            label="Only include genes with an orthologous gene in mouse"
                            control={<Checkbox />}
                            checked={f.mustHaveOrtholog}
                            onChange={(_, checked) => setGene("mustHaveOrtholog", checked)}
                        />
                    </FormGroup>
                </FormControl>
            </Stack>
            {/* The dialogs keep the site's light theme, not the sidebar's */}
            <ThemeProvider theme={theme}>
                {expressionBiosampleOpen && (
                    <BiosampleModal
                        open
                        onClose={() => setExpressionBiosampleOpen(false)}
                        assembly="GRCh38"
                        selected={f.selectedBiosample}
                        onSelectionChange={(biosample) => {
                            setGene("selectedBiosample", biosample);
                            setExpressionBiosampleOpen(false);
                        }}
                        prefilterBiosamples={(biosample) => biosample.rna_seq_tracks.length > 0}
                    />
                )}
                {linkageDialog && (
                    <LinkageBiosampleModal
                        open
                        method={linkageDialog.method}
                        onClose={handleLinkageCancel}
                        onSubmit={(biosample, includeInExpression) => {
                            dispatch({ type: "setLinkage", method: linkageDialog.method, biosample, includeInExpression });
                            setLinkageDialog(null);
                        }}
                    />
                )}
            </ThemeProvider>
        </FilterAccordion>
    );
}
