import { useState } from "react";
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from "@mui/material";
import BiotechIcon from "@mui/icons-material/Biotech";
import { LINKAGE_METHOD_OPTIONS } from "@/lib/constants";
import { useFilterActions, useFilters } from "@/state/filters";
import { GeneFilterState, GeneLinkingMethod } from "@/types/filters";
import BiosampleChip, { biosampleLabel } from "./BiosampleChip";
import { BiosampleModal } from "./BiosampleModal";
import FilterAccordion from "./FilterAccordion";
import { LinkageBiosampleModal } from "./LinkageBiosampleModal";

type Props = { expanded: boolean; onToggle: () => void };

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

    const radio = <K extends keyof GeneFilterState>(key: K, options: { value: string; label: string }[]) => (
        <RadioGroup row value={f[key]} onChange={(e) => setGene(key, e.target.value as GeneFilterState[K])}>
            {options.map((o) => (
                <FormControlLabel key={o.value} value={o.value} control={<Radio />} label={o.label} />
            ))}
        </RadioGroup>
    );
    const maxOrAverage = [
        { value: "max", label: "Max" },
        { value: "avg", label: "Average" },
    ];

    return (
        <FilterAccordion
            title="Genes"
            info="Filter results based on linked genes and thier linking method"
            expanded={expanded}
            onToggle={onToggle}
        >
            <FormControlLabel
                label="Linked Genes"
                control={<Checkbox checked={f.useGenes} onChange={() => setGene("useGenes", !f.useGenes)} />}
            />
            <Stack ml={2}>
                <FormControl fullWidth disabled={disabled}>
                    <Typography>Linking method</Typography>
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
                <FormControl disabled={disabled} sx={{ mt: 2 }}>
                    <Typography>Rank gene expression by</Typography>
                    {radio("rankGeneExpBy", maxOrAverage)}
                </FormControl>
                <Button
                    size="large"
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
                <FormControl disabled={disabled}>
                    <Typography sx={{ mt: 1 }}>Rank expression specificity by</Typography>
                    {radio("rankExpSpecBy", maxOrAverage)}
                </FormControl>
                <FormControl disabled={disabled}>
                    <Typography sx={{ mt: 1 }}>Rank # of linked genes by</Typography>
                    {radio("rankLinkedBy", [
                        { value: "most", label: "Most" },
                        { value: "least", label: "Least" },
                    ])}
                </FormControl>
                <FormControl disabled={disabled}>
                    <Typography sx={{ mt: 1 }}>Gene filters</Typography>
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
        </FilterAccordion>
    );
}
