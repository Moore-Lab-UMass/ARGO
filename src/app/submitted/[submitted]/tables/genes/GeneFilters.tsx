import React, { useEffect, useMemo, useState } from "react";
import { CompBiosample, ComputationalMethod, GeneAccordianProps, GeneLinkingMethod } from "../../../../types";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined, CancelRounded } from "@mui/icons-material"
import { COMPUTATIONAL_CELL_TYPES_QUERY, LINKED_GENES_CELL_TYPES_QUERY } from "../../../../queries";
import { useQuery } from "@apollo/client";
import BiotechIcon from '@mui/icons-material/Biotech';
import { EncodeBiosample } from "@weng-lab/ui-components";
import { BiosampleModal } from "../../../../components/BiosampleModal";
import { LinkageBiosampleModal } from "./LinkageBiosampleModal";

const computationalMethods: ComputationalMethod[] = [
    "ABC_(DNase_only)",
    "ABC_(full)",
    "EPIraction",
    "GraphRegLR",
    "rE2G_(DNase_only)",
    "rE2G_(extended)",
];

const GeneFilters: React.FC<GeneAccordianProps> = ({
    geneFilterVariables,
    updateGeneFilter,
    isExpanded,
    handleAccordionChange
}) => {
    const [open, setOpen] = useState(false);
    const [linkageBiosampleOpen, setLinkageBiosampleOpen] = useState(false);
    const [methodOfLinkage, setMethodOfLinkage] = useState<GeneLinkingMethod>(geneFilterVariables.methodOfLinkage);
    const [linkageBiosample, setLinkageBiosample] = useState<CompBiosample | null>(geneFilterVariables.linkageBiosample);
    const [biosample, setBiosample] = useState<EncodeBiosample | null>(geneFilterVariables.selectedBiosample)

    const { data: cellTypes } = useQuery(
        LINKED_GENES_CELL_TYPES_QUERY,
        {
            variables: { assay: methodOfLinkage.replace("_", "-") },
            skip: !geneFilterVariables.useGenes || methodOfLinkage === "distance" || methodOfLinkage === "eQTLs" || computationalMethods.includes(methodOfLinkage as ComputationalMethod),
        }
    );

    const { data: compuCellTypes } = useQuery(
        COMPUTATIONAL_CELL_TYPES_QUERY,
        {
            variables: { method: [methodOfLinkage as ComputationalMethod] },
            skip: !geneFilterVariables.useGenes || !computationalMethods.includes(methodOfLinkage as ComputationalMethod),
        }
    );

    const availableCellTypes: CompBiosample[] = useMemo(() => {
        if (!cellTypes && !compuCellTypes) return [];

        const biosamples = new Map<string, CompBiosample>();

        cellTypes?.getLinkedGenesCelltypesByAssay.forEach((item) => {
            biosamples.set(item.biosample_value, {
                name: item.biosample_value,
                ontology: item.tissue,
                displayname: item.displayname,
                cellType: item.celltype,
                lifeStage: "other",
                sampleType: "other",
                dnase_experiment_accession: null,
                h3k4me3_experiment_accession: null,
                h3k27ac_experiment_accession: null,
                ctcf_experiment_accession: null,
                atac_experiment_accession: null,
                dnase_file_accession: null,
                h3k4me3_file_accession: null,
                h3k27ac_file_accession: null,
                ctcf_file_accession: null,
                atac_file_accession: null,
                rna_seq_tracks: [], //the celltypes that do not match the registry should not have rna seq data
            });
        });

        compuCellTypes?.getCompuLinkedGenesCelltypes.forEach((item) => {
            if (!biosamples.has(item.biosample_value)) {
                biosamples.set(item.biosample_value, {
                    name: item.biosample_mapping ?? item.biosample_value,
                    ontology: item.tissue,
                    displayname: item.biosample_value,
                    cellType: item.biosample_value,
                    lifeStage: "other",
                    sampleType: "other",
                    dnase_experiment_accession: null,
                    h3k4me3_experiment_accession: null,
                    h3k27ac_experiment_accession: null,
                    ctcf_experiment_accession: null,
                    atac_experiment_accession: null,
                    dnase_file_accession: null,
                    h3k4me3_file_accession: null,
                    h3k27ac_file_accession: null,
                    ctcf_file_accession: null,
                    atac_file_accession: null,
                    rna_seq_tracks: [],
                });
            }
        });

        return Array.from(biosamples.values());
    }, [compuCellTypes, cellTypes]);

    useEffect(() => {
        if (geneFilterVariables.methodOfLinkage === "distance" && geneFilterVariables.linkageBiosample) {
            updateGeneFilter("linkageBiosample", null);
        }
    }, [geneFilterVariables.linkageBiosample, geneFilterVariables.methodOfLinkage, updateGeneFilter])

    const handleLinkageChange = (method: GeneLinkingMethod) => {
        if (method !== "distance") {
            setLinkageBiosampleOpen(true);
        } else {
            updateGeneFilter("methodOfLinkage", "distance");
        }
        setLinkageBiosample(null);
        updateGeneFilter("linkageBiosample", null);
        setMethodOfLinkage(method);
    }

    const handleLinkageBiosampleSubmit = (method: GeneLinkingMethod, biosample: EncodeBiosample, include: boolean) => {
        if (include && biosample.rna_seq_tracks.length > 0) {
            setBiosample(biosample)
            updateGeneFilter("selectedBiosample", biosample as EncodeBiosample)
        }
        updateGeneFilter("linkageBiosample", biosample);
        updateGeneFilter("methodOfLinkage", method);
        setLinkageBiosampleOpen(false);
        if (method !== methodOfLinkage) {
            setLinkageBiosample(null);
        }
    }

    const handleLinkageBiosampleDeslect = () => {
        setLinkageBiosample(null);
        updateGeneFilter("linkageBiosample", null);
        updateGeneFilter("methodOfLinkage", "distance");
    }

    const handleLinkageBiosampleClose = () => {
        setLinkageBiosampleOpen(false);
        setLinkageBiosample(null);
        if (!linkageBiosample) {
            handleLinkageChange("distance")
        }
    }

    const handleSelectedBiosample = (biosample) => {
        updateGeneFilter("selectedBiosample", biosample)
        setOpen(false);
    }

    const handleDeselectBiosample = () => {
        setBiosample(null);
        updateGeneFilter("selectedBiosample", null);
    }

    return (
        <Accordion
            square
            disableGutters
            expanded={isExpanded('gene')}
            onChange={handleAccordionChange('gene')}
            sx={{ backgroundColor: "rgba(249, 248, 244, 1)" }}
        >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: isExpanded('gene') ? '#030f98' : 'inherit' }} />}>
                <Stack direction="row" spacing={1} alignItems={'center'}>
                    <Typography
                        sx={{
                            color: isExpanded('gene') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('gene') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                    >
                        Genes
                    </Typography>
                    <Tooltip arrow placement="right-end" title={"Filter results based on linked genes and thier linking method"}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <FormControlLabel value="genes" control={<Checkbox onChange={() => updateGeneFilter("useGenes", !geneFilterVariables.useGenes)} checked={geneFilterVariables.useGenes} />} label="Linked Genes" />
                <Stack ml={2}>
                    <FormControl
                        fullWidth
                        disabled={!geneFilterVariables.useGenes}
                    >
                        <Typography>Linking method</Typography>
                        <Select
                            value={geneFilterVariables.methodOfLinkage}
                            onChange={(event) => {
                                handleLinkageChange(event.target.value as GeneLinkingMethod)
                            }}
                            size="small"
                        >
                            <MenuItem value="distance">Distance</MenuItem>
                            {[
                                { value: "Intact_HiC", label: "Intact Hi-C Loops" },
                                { value: "CTCF_ChIAPET", label: "CTCF ChIA-PET Interactions" },
                                { value: "RNAPII_ChIAPET", label: "RNAPII ChIA-PET Interactions" },
                                { value: "CRISPRi_FlowFISH", label: "CRISPRi-FlowFISH" },
                                { value: "eQTLs", label: "eQTLs" },
                                { value: "ABC_(DNase_only)", label: "ABC (DNase Only)" },
                                { value: "ABC_(full)", label: "ABC (Full)" },
                                { value: "EPIraction", label: "EPIraction" },
                                { value: "GraphRegLR", label: "GraphRegLR" },
                                { value: "rE2G_(DNase_only)", label: "rE2G (DNase Only)" },
                                { value: "rE2G_(extended)", label: "rE2G (Extended)" },
                            ].map((item) => {
                                const menuItem = (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </MenuItem>
                                );
                                return menuItem
                            })}
                        </Select>
                    </FormControl>
                    {geneFilterVariables.linkageBiosample && (
                        <Paper elevation={0} sx={{ width: "fit-content", cursor: "pointer" }} onClick={() => { setLinkageBiosampleOpen(true); setLinkageBiosample(geneFilterVariables.linkageBiosample) }}>
                            <Stack
                                borderRadius={1}
                                direction={"row"}
                                justifyContent={"space-between"}
                                sx={{ backgroundColor: theme => theme.palette.secondary.main }}
                                alignItems={"center"}
                                width={"100%"}
                            >
                                <Typography sx={{ color: "#2C5BA0", pl: 1 }}>
                                    {geneFilterVariables.methodOfLinkage === "eQTLs"
                                        ? geneFilterVariables.linkageBiosample.displayname
                                        : `${geneFilterVariables.linkageBiosample.ontology.charAt(0).toUpperCase()}${geneFilterVariables.linkageBiosample.ontology.slice(1)} - ${geneFilterVariables.linkageBiosample.displayname}`}
                                </Typography>
                                <IconButton
                                    sx={{ zIndex: 10 }}
                                    onClick={(e) => { handleLinkageBiosampleDeslect(); e.stopPropagation() }}
                                >
                                    <CancelRounded />
                                </IconButton>
                            </Stack>
                        </Paper>
                    )}
                    <FormControl disabled={!geneFilterVariables.useGenes} sx={{ mt: 2 }}>
                        <Typography>Rank gene expression by</Typography>
                        <RadioGroup
                            row
                            value={geneFilterVariables.rankGeneExpBy}
                            onChange={(event) => updateGeneFilter("rankGeneExpBy", event.target.value as "max" | "avg")}
                        >
                            <FormControlLabel
                                value="max"
                                control={<Radio />}
                                label="Max"
                            />
                            <FormControlLabel
                                value="avg"
                                control={<Radio />}
                                label="Average"
                            />
                        </RadioGroup>
                    </FormControl>
                    <Button
                        size="large"
                        startIcon={<BiotechIcon />}
                        onClick={() => setOpen(true)}
                        disabled={!geneFilterVariables.useGenes}
                        sx={{ width: "fit-content" }}
                        variant="outlined"
                    >
                        Gene expression biosample
                    </Button>
                    {geneFilterVariables.selectedBiosample && (
                        <Paper elevation={0} sx={{ width: "fit-content" }}>
                            <Stack
                                borderRadius={1}
                                direction={"row"}
                                justifyContent={"space-between"}
                                sx={{ backgroundColor: theme => theme.palette.secondary.main }}
                                alignItems={"center"}
                                width={"100%"}
                            >
                                <Typography
                                    sx={{ color: "#2C5BA0", pl: 1 }}
                                >
                                    {geneFilterVariables.selectedBiosample.ontology.charAt(0).toUpperCase() +
                                        geneFilterVariables.selectedBiosample.ontology.slice(1) +
                                        " - " +
                                        geneFilterVariables.selectedBiosample.displayname}
                                </Typography>
                                <IconButton
                                    onClick={() => { handleDeselectBiosample() }}
                                >
                                    <CancelRounded />
                                </IconButton>
                            </Stack>
                        </Paper>
                    )}
                    <FormControl disabled={!geneFilterVariables.useGenes}>
                        <Typography sx={{ mt: 1 }}>Rank expression specificity by</Typography>
                        <RadioGroup
                            row
                            value={geneFilterVariables.rankExpSpecBy}
                            onChange={(event) => updateGeneFilter("rankExpSpecBy", event.target.value as "max" | "avg")}
                        >
                            <FormControlLabel
                                value="max"
                                control={<Radio />}
                                label="Max"
                            />
                            <FormControlLabel
                                value="avg"
                                control={<Radio />}
                                label="Average"
                            />
                        </RadioGroup>
                    </FormControl>
                    <FormControl disabled={!geneFilterVariables.useGenes}>
                        <Typography sx={{ mt: 1 }}>Rank # of linked genes by</Typography>
                        <RadioGroup
                            row
                            value={geneFilterVariables.rankLinkedBy}
                            onChange={(event) => updateGeneFilter("rankLinkedBy", event.target.value as "most" | "least")}
                        >
                            <FormControlLabel
                                value="most"
                                control={<Radio />}
                                label="Most"
                            />
                            <FormControlLabel
                                value="least"
                                control={<Radio />}
                                label="Least"
                            />
                        </RadioGroup>
                    </FormControl>
                    <FormControl disabled={!geneFilterVariables.useGenes}>
                        <Typography sx={{ mt: 1 }}>Gene filters</Typography>
                        <FormGroup>
                            <FormControlLabel
                                label="Must be protein coding"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustBeProteinCoding}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustBeProteinCoding", e.target.checked)}
                            />
                            <FormControlLabel
                                label="Only include genes with an orthologous gene in mouse"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustHaveOrtholog}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustHaveOrtholog", e.target.checked)}
                            />
                        </FormGroup>
                    </FormControl>
                </Stack>
            </AccordionDetails>
            <BiosampleModal
                open={open}
                onClose={() => setOpen(false)}
                assembly={"GRCh38"}
                selected={biosample}
                onSelectionChange={(biosample) => handleSelectedBiosample(biosample)}
                prefilterBiosamples={(biosample) => biosample.rna_seq_tracks.length > 0}
            />
            <LinkageBiosampleModal
                open={linkageBiosampleOpen}
                onClose={() => handleLinkageBiosampleClose()}
                assembly={"GRCh38"}
                handleLinkageBiosampleSubmit={handleLinkageBiosampleSubmit}
                extraRows={availableCellTypes}
                method={methodOfLinkage}
            />
        </Accordion>
    )
}

export default GeneFilters;