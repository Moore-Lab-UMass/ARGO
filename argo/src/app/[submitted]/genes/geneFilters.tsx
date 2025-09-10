import React, { useEffect, useMemo, useState } from "react";
import { ComputationalMethod, GeneAccordianProps, GeneLinkingMethod } from "../../types";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Checkbox, CircularProgress, FormControl, FormControlLabel, FormGroup, IconButton, MenuItem, Modal, Paper, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined, CancelRounded } from "@mui/icons-material"
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import CloseIcon from '@mui/icons-material/Close';
import { COMPUTATIONAL_CELL_TYPES_QUERY, LINKED_GENES_CELL_TYPES_QUERY } from "../../queries";
import { useQuery } from "@apollo/client";
import BiotechIcon from '@mui/icons-material/Biotech';
import { RegistryBiosamplePlusRNA } from "../../_biosampleTables/types";

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
    const [linkageBiosample, setLinkageBiosample] = useState<RegistryBiosamplePlusRNA | null>(geneFilterVariables.linkageBiosample);
    const [include, setInclude] = useState(false);

    const { data: cellTypes, loading: loadingCellTypes } = useQuery(
        LINKED_GENES_CELL_TYPES_QUERY,
        {
            variables: { assay: methodOfLinkage.replace("_", "-") },
            skip: !geneFilterVariables.useGenes || methodOfLinkage === "distance" || computationalMethods.includes(methodOfLinkage as ComputationalMethod),
        }
    );

    const { data: compuCellTypes, loading: loadingCompuCellTypes } = useQuery(
        COMPUTATIONAL_CELL_TYPES_QUERY,
        {
            variables: { method: [methodOfLinkage as ComputationalMethod] },
            skip: !geneFilterVariables.useGenes || !computationalMethods.includes(methodOfLinkage as ComputationalMethod),
        }
    );

    const availableCellTypes: RegistryBiosamplePlusRNA[] = useMemo(() => {
        if (!cellTypes && !compuCellTypes) return [];

        const biosamples = new Map<string, RegistryBiosamplePlusRNA>();

        cellTypes?.getLinkedGenesCelltypesByAssay.forEach((item) => {
            biosamples.set(item.biosample_value, {
                name: item.biosample_value,
                ontology: item.tissue,
                displayname: item.displayname,
                lifeStage: "adult",      // fill with actual value if available
                sampleType: "tissue",     // fill with actual value if available
                dnase: null,
                h3k4me3: null,
                h3k27ac: null,
                ctcf: null,
                atac: null,
                dnase_signal: null,
                h3k4me3_signal: null,
                h3k27ac_signal: null,
                ctcf_signal: null,
                atac_signal: null,
                rnaseq: false, // default, update later if you have RNA-seq info
            });
        });

        compuCellTypes?.getCompuLinkedGenesCelltypes.forEach((item) => {
            if (!biosamples.has(item.biosample_value)) {
                biosamples.set(item.biosample_value, {
                    name: item.biosample_value,
                    ontology: item.tissue,
                    displayname: "",
                    lifeStage: "",
                    sampleType: "",
                    dnase: null,
                    h3k4me3: null,
                    h3k27ac: null,
                    ctcf: null,
                    atac: null,
                    dnase_signal: null,
                    h3k4me3_signal: null,
                    h3k27ac_signal: null,
                    ctcf_signal: null,
                    atac_signal: null,
                    rnaseq: false,
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
            updateGeneFilter("linkageBiosample", null);
            updateGeneFilter("methodOfLinkage", "distance");
        }
        setMethodOfLinkage(method);
    }

    const handleLinkageBiosampleSubmit = (method: GeneLinkingMethod, cellType: RegistryBiosamplePlusRNA) => {
        if (include && cellType.rnaseq) {
            updateGeneFilter("selectedBiosample", cellType as RegistryBiosamplePlusRNA)
        }
        updateGeneFilter("linkageBiosample", cellType);
        updateGeneFilter("methodOfLinkage", method);
        setLinkageBiosampleOpen(false);
        setLinkageBiosample(null);
        setInclude(false);
    }

    const handleLinkageBiosampleDeslect = () => {
        setLinkageBiosample(null);
        setInclude(false);
        updateGeneFilter("linkageBiosample", null);
        updateGeneFilter("methodOfLinkage", "distance");
    }

    const handleSelectedBiosample = (biosample) => {
        updateGeneFilter("selectedBiosample", biosample)
        setOpen(false);
    }

    const handleDeselectBiosample = () => {
        updateGeneFilter("selectedBiosample", null);
    }

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        p: 4,
    };

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
                    <Tooltip arrow placement="right-end" title={"Filter results based on linked genes and thier method of linkage"}>
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
                        <Typography>Method of Linkage</Typography>
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
                                    {geneFilterVariables.linkageBiosample.ontology.charAt(0).toUpperCase() +
                                        geneFilterVariables.linkageBiosample.ontology.slice(1) +
                                        " - " +
                                        geneFilterVariables.linkageBiosample.displayname}
                                </Typography>
                                <IconButton
                                    onClick={() => { handleLinkageBiosampleDeslect() }}
                                >
                                    <CancelRounded />
                                </IconButton>
                            </Stack>
                        </Paper>
                    )}
                    <FormControl disabled={!geneFilterVariables.useGenes} sx={{ mt: 2 }}>
                        <Typography>Rank Gene Expression By</Typography>
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
                        Gene Expression Biosample
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
                        <Typography sx={{ mt: 1 }}>Rank Expression Specificity By</Typography>
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
                        <Typography sx={{ mt: 1 }}>Gene Filters</Typography>
                        <FormGroup>
                            <FormControlLabel
                                label="Must be Protein Coding"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustBeProteinCoding}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustBeProteinCoding", e.target.checked)}
                            />
                            <FormControlLabel
                                label="Genes Must Have Mouse Ortholog"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustHaveOrtholog}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustHaveOrtholog", e.target.checked)}
                            />
                        </FormGroup>
                    </FormControl>
                </Stack>
            </AccordionDetails>
            <Modal open={open} onClose={() => setOpen(false)}>
                <Paper sx={style}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Filter Genes Through Biosamples
                    </Typography>
                    <br />
                    <BiosampleTables
                        selected={geneFilterVariables.selectedBiosample?.name}
                        onChange={(biosample) => handleSelectedBiosample(biosample)}
                        assembly={"GRCh38"}
                        preFilterBiosamples={(biosample: RegistryBiosamplePlusRNA) => availableCellTypes.some((available) => available.name === biosample.name)}
                        hasRNASeq
                    />
                </Paper>
            </Modal>
            <Modal open={linkageBiosampleOpen} onClose={() => { setLinkageBiosampleOpen(false); setLinkageBiosample(null); setInclude(false); }}>
                <Paper sx={style}>
                    <IconButton
                        aria-label="close"
                        onClick={() => { setLinkageBiosampleOpen(false); setLinkageBiosample(null); setInclude(false); }}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Select Biosample for Linkage Method: {methodOfLinkage}
                    </Typography>
                    <br />
                    {loadingCellTypes || loadingCompuCellTypes && (
                        <CircularProgress />
                    )}
                    <Box mb={2}>
                        {linkageBiosample && (
                            <Stack
                                minWidth={"350px"}
                                direction="row"
                                alignItems={"center"}
                                borderRadius={1}
                                justifyContent={"space-between"}
                                sx={{ backgroundColor: theme => theme.palette.secondary.main }}
                                width={"fit-content"}
                                paddingX={1}
                            >
                                <Typography><b>Selected: </b>{linkageBiosample.displayname}</Typography>
                                <IconButton onClick={() => setLinkageBiosample(null)}>
                                    <CancelRounded />
                                </IconButton>
                            </Stack>
                        )}
                        <BiosampleTables
                            selected={linkageBiosample?.name}
                            onChange={(biosample) => setLinkageBiosample(biosample)}
                            assembly={"GRCh38"}
                            preFilterBiosamples={(biosample) => availableCellTypes.some((available) => available.name === biosample.name)}
                            hasRNASeq
                            additionalCellTypes={availableCellTypes}
                        />
                    </Box>
                    <Stack width="100%" direction={"row"} spacing={1} alignItems={"center"} justifyContent={"flex-end"}>
                        <FormGroup>
                            <Tooltip
                                title={
                                    !linkageBiosample || !linkageBiosample.rnaseq
                                        ? "Selected Biosample does not have RNASeq Data and can not be used in Gene Expression Calculation"
                                        : ""
                                }
                            >
                                <span>
                                    <FormControlLabel
                                        control={<Checkbox />}
                                        label="Include in Gene Expression Calculation"
                                        onChange={setInclude.bind(this, !include)}
                                        checked={(!linkageBiosample?.rnaseq) ? false : include}
                                        disabled={!linkageBiosample || !linkageBiosample.rnaseq}
                                    />
                                </span>
                            </Tooltip>
                        </FormGroup>
                        <Button
                        variant="contained"
                        onClick={() => handleLinkageBiosampleSubmit(methodOfLinkage, linkageBiosample)}
                    >
                        Submit
                    </Button>
                    </Stack>
                </Paper>
            </Modal>
        </Accordion>
    )
}

export default GeneFilters;