import { Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from "@mui/material";
import { CONSERVATION_TRACKS } from "@/lib/constants";
import { useFilterActions, useFilters } from "@/state/filters";
import { Alignment, DataSource, MotifCatalog, MotifQuality, SequenceFilterState } from "@/types/filters";
import CheckboxGroup, { CheckboxOption } from "./CheckboxGroup";
import FilterAccordion from "./FilterAccordion";
import SegmentedControl from "./SegmentedControl";

const QUALITY_OPTIONS: CheckboxOption<keyof MotifQuality>[] = [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "c", label: "C" },
    { key: "d", label: "D" },
];

const DATA_SOURCE_OPTIONS: CheckboxOption<keyof DataSource>[] = [
    { key: "p", label: "ChIP-seq" },
    { key: "s", label: "HT-SELEX" },
    { key: "m", label: "Methyl HT-SELEX" },
    { key: "g", label: "Genomic HT-SELEX" },
    { key: "i", label: "SMiLe-Seq" },
    { key: "b", label: "PBM" },
];

const QUALITY_INFO = (
    <div>
        <b>A:</b> Found in both ChIP-seq and Ht-SELEX <br />
        <b>B:</b> Reproducible in ChIP-seq or HT-SELEX <br />
        <b>C:</b> Found in a single dataset <br />
        <b>D:</b> Subtypes built from motifs exclusively inherited from HOCOMOCO-v12
    </div>
);

const DATA_SOURCE_INFO = (
    <div>
        <b>P:</b> ChIP-seq <br />
        <b>S:</b> HT-SELEX <br />
        <b>M:</b> Methyl HT-SELEX <br />
        <b>G:</b> Genomic HT-SELEX <br />
        <b>I:</b> SMiLe-Seq <br />
        <b>B:</b> PBM <br />
    </div>
);

type Props = { expanded: boolean; onToggle: () => void };

const RANK_BY_OPTIONS: { value: SequenceFilterState["rankBy"]; label: string }[] = [
    { value: "min", label: "Min" },
    { value: "max", label: "Max" },
    { value: "avg", label: "Avg" },
];

/** e.g. "phyloP - 241 mammals · max · TF motifs" */
function summarize(f: SequenceFilterState): string {
    const parts: string[] = [];
    if (f.useConservation) parts.push(CONSERVATION_TRACKS[f.alignment].menuLabel, f.rankBy);
    if (f.useMotifs) parts.push("TF motifs");
    return parts.join(" · ");
}

export default function SequenceFilters({ expanded, onToggle }: Props) {
    const { sequence: f } = useFilters();
    const { setSequence, dispatch } = useFilterActions();

    const setEnabled = (on: boolean) => {
        setSequence("useConservation", on);
        setSequence("useMotifs", on);
    };

    return (
        <FilterAccordion
            category="sequence"
            info="Filter results based on conservation score (Mammal, Primate, and Vertebrate) or TF Motif details"
            enabled={f.useConservation || f.useMotifs}
            onEnabledChange={setEnabled}
            summary={summarize(f)}
            expanded={expanded}
            onToggle={onToggle}
        >
            <FormControlLabel
                label="Conservation"
                control={<Checkbox checked={f.useConservation} onChange={() => setSequence("useConservation", !f.useConservation)} />}
            />
            <Stack ml={1} gap={1.5}>
                <FormControl fullWidth>
                    <Select
                        size="small"
                        value={f.alignment}
                        disabled={!f.useConservation}
                        inputProps={{ "aria-label": "Conservation track" }}
                        onChange={(e) => setSequence("alignment", e.target.value as Alignment)}
                    >
                        {Object.entries(CONSERVATION_TRACKS)
                            .filter(([, track]) => !track.hidden)
                            .map(([value, track]) => (
                                <MenuItem key={value} value={value}>
                                    {track.menuLabel}
                                </MenuItem>
                            ))}
                    </Select>
                </FormControl>
                <SegmentedControl
                    label="Rank conservation scores by"
                    value={f.rankBy}
                    options={RANK_BY_OPTIONS}
                    onChange={(v) => setSequence("rankBy", v)}
                    disabled={!f.useConservation}
                />
            </Stack>

            <FormGroup sx={{ mt: 1 }}>
                <FormControlLabel
                    label="TF Motifs"
                    control={<Checkbox checked={f.useMotifs} onChange={() => setSequence("useMotifs", !f.useMotifs)} />}
                />
                <Stack ml={1}>
                    {/* Factorbook and ZMotif catalogs are not available yet */}
                    <RadioGroup
                        row
                        value={f.motifCatalog}
                        onChange={(e) => dispatch({ type: "setMotifCatalog", catalog: e.target.value as MotifCatalog })}
                    >
                        <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!f.useMotifs} />
                    </RadioGroup>
                    {f.motifCatalog === "hocomoco" && (
                        <>
                            <CheckboxGroup
                                label="Motif quality"
                                info={QUALITY_INFO}
                                options={QUALITY_OPTIONS}
                                values={f.motifQuality}
                                onChange={(v) => setSequence("motifQuality", v)}
                                disabled={!f.useMotifs}
                                layout="chips"
                                sx={{ mt: 0.5 }}
                            />
                            <CheckboxGroup
                                label="Data source"
                                info={DATA_SOURCE_INFO}
                                options={DATA_SOURCE_OPTIONS}
                                values={f.dataSource}
                                onChange={(v) => setSequence("dataSource", v)}
                                disabled={!f.useMotifs}
                                sx={{ mt: 1.5 }}
                            />
                        </>
                    )}
                </Stack>
            </FormGroup>

            <FormGroup>
                <FormControl sx={{ ml: 1 }}>
                    <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 1 }}>Include in ranking</Typography>
                    <FormControlLabel
                        label="Number of overlapping motifs"
                        disabled={!f.useMotifs}
                        control={
                            <Checkbox
                                checked={f.numOverlappingMotifs}
                                onChange={() => setSequence("numOverlappingMotifs", !f.numOverlappingMotifs)}
                            />
                        }
                    />
                    <FormControlLabel
                        label="Motif score delta"
                        disabled={!f.useMotifs}
                        control={<Checkbox checked={f.motifScoreDelta} onChange={() => setSequence("motifScoreDelta", !f.motifScoreDelta)} />}
                    />
                </FormControl>
            </FormGroup>
        </FilterAccordion>
    );
}
