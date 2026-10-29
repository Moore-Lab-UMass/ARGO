import { useState } from "react";
import { Button, Checkbox, FormControlLabel, Radio, RadioGroup, Stack, ThemeProvider } from "@mui/material";
import theme from "@/app/theme";
import BiotechIcon from "@mui/icons-material/Biotech";
import { useFilterActions, useFilters } from "@/state/filters";
import { Assay, CCREClasses, ElementFilterState } from "@/types/filters";
import BiosampleChip, { biosampleLabel } from "./BiosampleChip";
import { BiosampleModal } from "./BiosampleModal";
import CheckboxGroup, { CheckboxOption } from "./CheckboxGroup";
import FilterAccordion from "./FilterAccordion";
import SegmentedControl from "./SegmentedControl";

const CLASS_OPTIONS: CheckboxOption<keyof CCREClasses>[] = [
    { key: "PLS", label: "Promoter" },
    { key: "pELS", label: "Proximal enhancer" },
    { key: "dELS", label: "Distal enhancer" },
    { key: "CA-H3K4me3", label: "CA-H3K4me3" },
    { key: "CA-CTCF", label: "CA-CTCF" },
    { key: "CA-TF", label: "CA-TF" },
    { key: "CA", label: "CA" },
    { key: "TF", label: "TF" },
];

const ASSAY_LABELS: { key: Assay; label: string }[] = [
    { key: "dnase", label: "DNase" },
    { key: "h3k4me3", label: "H3K4me3" },
    { key: "h3k27ac", label: "H3K27ac" },
    { key: "ctcf", label: "CTCF" },
    { key: "atac", label: "ATAC" },
];

type Props = { expanded: boolean; onToggle: () => void };

/** e.g. "GRCh38 · all biosamples · 5 assays · avg" */
function summarize(f: ElementFilterState): string {
    const assays = Object.values(f.assays).filter(Boolean).length;
    const biosample = f.selectedBiosample ? f.selectedBiosample.displayname : "all biosamples";
    return [f.cCREAssembly, biosample, `${assays} ${assays === 1 ? "assay" : "assays"}`, f.rankBy].join(" · ");
}

export default function ElementFilters({ expanded, onToggle }: Props) {
    const { element: f } = useFilters();
    const { setElement, dispatch } = useFilterActions();
    const [biosampleOpen, setBiosampleOpen] = useState(false);
    const disabled = !f.usecCREs;

    const assayOptions = ASSAY_LABELS.map((a) => ({ ...a, unavailable: !f.availableAssays[a.key] }));

    return (
        <FilterAccordion
            category="element"
            info="Filter results based on overlapping cCREs and their classification or assay Z-scores"
            enabled={f.usecCREs}
            onEnabledChange={(on) => setElement("usecCREs", on)}
            summary={summarize(f)}
            expanded={expanded}
            onToggle={onToggle}
        >
            <Stack>
                <RadioGroup
                    row
                    value={f.cCREAssembly}
                    onChange={(e) =>
                        dispatch({ type: "setElementAssembly", assembly: e.target.value as ElementFilterState["cCREAssembly"] })
                    }
                >
                    <FormControlLabel value="GRCh38" control={<Radio />} label="GRCh38" disabled={disabled} />
                    <FormControlLabel value="mm10" control={<Radio />} label="mm10" disabled={disabled} />
                </RadioGroup>
                <FormControlLabel
                    label="Only include cCREs with an orthologous cCRE in mouse"
                    sx={{ mb: 1 }}
                    control={
                        <Checkbox
                            checked={f.mustHaveOrtholog}
                            onChange={() => setElement("mustHaveOrtholog", !f.mustHaveOrtholog)}
                            disabled={disabled || f.cCREAssembly === "mm10"}
                        />
                    }
                />
                <Stack>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{ width: "fit-content" }}
                        onClick={() => setBiosampleOpen(true)}
                        disabled={disabled}
                        startIcon={<BiotechIcon />}
                    >
                        Within a biosample
                    </Button>
                    {f.selectedBiosample && (
                        <BiosampleChip
                            label={biosampleLabel(f.selectedBiosample)}
                            onClear={() => dispatch({ type: "selectElementBiosample", biosample: null })}
                        />
                    )}
                </Stack>
                <CheckboxGroup
                    label="Include classes"
                    options={CLASS_OPTIONS}
                    values={f.classes}
                    onChange={(v) => setElement("classes", v)}
                    disabled={disabled}
                    sx={{ mt: 1 }}
                />
                <CheckboxGroup
                    label="Include assay z-scores"
                    options={assayOptions}
                    values={f.assays}
                    onChange={(v) => setElement("assays", v)}
                    disabled={disabled}
                    selectAllLabel="Select All"
                    sx={{ mt: 2 }}
                />
            </Stack>
            <SegmentedControl
                label="Rank cCREs with matching input region by"
                value={f.rankBy}
                options={[
                    { value: "max", label: "Max" },
                    { value: "avg", label: "Avg" },
                ]}
                onChange={(v) => setElement("rankBy", v)}
                disabled={disabled}
            />
            {biosampleOpen && (
                // The dialog keeps the site's light theme, not the sidebar's
                <ThemeProvider theme={theme}>
                    <BiosampleModal
                        open
                        onClose={() => setBiosampleOpen(false)}
                        assembly={f.cCREAssembly}
                        selected={f.selectedBiosample}
                        onSelectionChange={(biosample) => {
                            dispatch({ type: "selectElementBiosample", biosample });
                            setBiosampleOpen(false);
                        }}
                    />
                </ThemeProvider>
            )}
        </FilterAccordion>
    );
}
