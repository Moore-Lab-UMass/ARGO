import { useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import { useFilterActions, useFilters } from "@/state/filters";
import { Assay, CCREClasses, ElementFilterState } from "@/types/filters";
import BiosampleChip, { biosampleLabel } from "./BiosampleChip";
import { BiosampleModal } from "./BiosampleModal";
import CheckboxGroup, { CheckboxOption } from "./CheckboxGroup";
import FilterAccordion from "./FilterAccordion";

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

export default function ElementFilters({ expanded, onToggle }: Props) {
    const { element: f } = useFilters();
    const { setElement, dispatch } = useFilterActions();
    const [biosampleOpen, setBiosampleOpen] = useState(false);
    const disabled = !f.usecCREs;

    const assayOptions = ASSAY_LABELS.map((a) => ({ ...a, unavailable: !f.availableAssays[a.key] }));

    return (
        <FilterAccordion
            title="Elements"
            info="Filter results based on overlapping cCREs and thier classification or assay Z-scores"
            expanded={expanded}
            onToggle={onToggle}
        >
            <FormControlLabel
                label="Overlapping cCREs"
                control={<Checkbox checked={f.usecCREs} onChange={() => setElement("usecCREs", !f.usecCREs)} />}
            />
            <Stack ml={2}>
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
                        size="large"
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
            <FormControl sx={{ ml: 2, mt: 1 }}>
                <Typography>Rank cCREs with matching input region by</Typography>
                <RadioGroup row value={f.rankBy} onChange={(e) => setElement("rankBy", e.target.value as ElementFilterState["rankBy"])}>
                    <FormControlLabel value="max" control={<Radio disabled={disabled} />} label="Max" />
                    <FormControlLabel value="avg" control={<Radio disabled={disabled} />} label="Average" />
                </RadioGroup>
            </FormControl>
            {biosampleOpen && (
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
            )}
        </FilterAccordion>
    );
}
