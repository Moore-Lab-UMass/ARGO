import { Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Radio, RadioGroup, Select, Stack, Typography } from "@mui/material";
import { CONSERVATION_TRACKS } from "@/lib/constants";
import { useFilterActions, useFilters } from "@/state/filters";
import { Alignment, DataSource, MotifCatalog, MotifQuality, SequenceFilterState } from "@/types/filters";
import CheckboxGroup, { CheckboxOption } from "./CheckboxGroup";
import FilterAccordion from "./FilterAccordion";

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

export default function SequenceFilters({ expanded, onToggle }: Props) {
    const { sequence: f } = useFilters();
    const { setSequence, dispatch } = useFilterActions();

    return (
        <FilterAccordion
            title="Sequence"
            info="Filter results based on conservation score (Mammal, Primate, and Vertebrate) or TF Motif details"
            expanded={expanded}
            onToggle={onToggle}
        >
            <FormControlLabel
                label="Conservation"
                control={<Checkbox checked={f.useConservation} onChange={() => setSequence("useConservation", !f.useConservation)} />}
            />
            <Stack ml={2}>
                <FormControl fullWidth>
                    <Select
                        size="small"
                        value={f.alignment}
                        disabled={!f.useConservation}
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
                <FormControl sx={{ mt: 1 }}>
                    <Typography>Rank conservation scores by</Typography>
                    <RadioGroup
                        row
                        value={f.rankBy}
                        onChange={(e) => setSequence("rankBy", e.target.value as SequenceFilterState["rankBy"])}
                    >
                        <FormControlLabel value="min" control={<Radio disabled={!f.useConservation} />} label="Min" />
                        <FormControlLabel value="max" control={<Radio disabled={!f.useConservation} />} label="Max" />
                        <FormControlLabel value="avg" control={<Radio disabled={!f.useConservation} />} label="Average" />
                    </RadioGroup>
                </FormControl>
            </Stack>

            <FormGroup>
                <FormControlLabel
                    label="TF Motifs"
                    control={<Checkbox checked={f.useMotifs} onChange={() => setSequence("useMotifs", !f.useMotifs)} />}
                />
                <Stack ml={2}>
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
                                layout="row"
                                selectAllLabel="Select All"
                                sx={{ mt: 1 }}
                            />
                            <CheckboxGroup
                                label="Data source"
                                info={DATA_SOURCE_INFO}
                                options={DATA_SOURCE_OPTIONS}
                                values={f.dataSource}
                                onChange={(v) => setSequence("dataSource", v)}
                                disabled={!f.useMotifs}
                                sx={{ mt: 1 }}
                            />
                        </>
                    )}
                </Stack>
            </FormGroup>

            <FormGroup>
                <FormControl sx={{ marginLeft: 2 }}>
                    <Typography>Include in ranking</Typography>
                    <FormControlLabel
                        label="Number of Overlaping Motifs"
                        disabled={!f.useMotifs}
                        control={
                            <Checkbox
                                checked={f.numOverlappingMotifs}
                                onChange={() => setSequence("numOverlappingMotifs", !f.numOverlappingMotifs)}
                            />
                        }
                    />
                    <FormControlLabel
                        label="Motif Score Delta"
                        disabled={!f.useMotifs}
                        control={<Checkbox checked={f.motifScoreDelta} onChange={() => setSequence("motifScoreDelta", !f.motifScoreDelta)} />}
                    />
                </FormControl>
            </FormGroup>
        </FilterAccordion>
    );
}
