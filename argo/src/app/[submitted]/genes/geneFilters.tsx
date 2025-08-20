import React, { useEffect } from "react";
import { GeneAccordianProps, GeneLinkingMethod } from "../../types";
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined, CancelRounded } from "@mui/icons-material"
import BiosampleTables from "../../_biosampleTables/BiosampleTables";

const GeneFilters: React.FC<GeneAccordianProps> = ({
    geneFilterVariables,
    updateGeneFilter,
    isExpanded,
    handleAccordionChange
}) => {

    //change assays and availible assays depending on if there is a biosample selected or not
    const handleSelectedBiosample = (biosample) => {
        updateGeneFilter("selectedBiosample", biosample)
    }

    const handleDeselectBiosample = () => {
        updateGeneFilter("selectedBiosample", null);
    }

    useEffect(() => {
        if (geneFilterVariables.selectedBiosample?.length === 0) {
            updateGeneFilter("selectedBiosample", null);
        }
    }, [geneFilterVariables.selectedBiosample, updateGeneFilter])

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
                                updateGeneFilter("methodOfLinkage", event.target.value as GeneLinkingMethod)
                                console.log(event.target.value)
                            }}
                            size="small"
                        >
                            <MenuItem value="distance">Distance</MenuItem>
                            <Tooltip
                                title={
                                    geneFilterVariables.selectedBiosample === null
                                        ? "Select a biosample to include other gene linking methods"
                                        : ""
                                }
                                disableHoverListener={geneFilterVariables.selectedBiosample !== null}
                                placement="top"
                            >
                                <span>
                                    <MenuItem value="Intact_HiC" disabled={geneFilterVariables.selectedBiosample === null}>
                                        Intact Hi-C Loops
                                    </MenuItem>
                                    <MenuItem value="CTCF_ChIAPET" disabled={geneFilterVariables.selectedBiosample === null}>
                                        CTCF ChIA-PET Interactions
                                    </MenuItem>
                                    <MenuItem value="RNAPII_ChIAPET" disabled={geneFilterVariables.selectedBiosample === null}>
                                        RNAPII ChIA-PET Interactions
                                    </MenuItem>
                                    <MenuItem value="CRISPRi_FlowFISH" disabled={geneFilterVariables.selectedBiosample === null}>
                                        CRISPRi-FlowFISH
                                    </MenuItem>
                                    <MenuItem value="eQTLs" disabled={geneFilterVariables.selectedBiosample === null}>
                                        eQTLs
                                    </MenuItem>
                                    <MenuItem value="ABCD" disabled={geneFilterVariables.selectedBiosample === null}>
                                        ABC (DNase Only)
                                    </MenuItem>
                                    <MenuItem value="ABCF" disabled={geneFilterVariables.selectedBiosample === null}>
                                        ABC (Full)
                                    </MenuItem>
                                    <MenuItem value="EPIraction" disabled={geneFilterVariables.selectedBiosample === null}>
                                        EPIraction
                                    </MenuItem>
                                    <MenuItem value="GraphRegLR" disabled={geneFilterVariables.selectedBiosample === null}>
                                        GraphRegLR
                                    </MenuItem>
                                    <MenuItem value="rE2GD" disabled={geneFilterVariables.selectedBiosample === null}>
                                        rE2G (DNase Only)
                                    </MenuItem>
                                    <MenuItem value="rE2GE" disabled={geneFilterVariables.selectedBiosample === null}>
                                        rE2G (Extended)
                                    </MenuItem>
                                </span>
                            </Tooltip>
                        </Select>
                    </FormControl>
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
                        <Typography sx={{ mt: 1 }}>Rank Gene Expression By</Typography>
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
                    {geneFilterVariables.selectedBiosample && (
                        <Paper elevation={0}>
                            <Stack
                                borderRadius={1}
                                direction={"row"}
                                spacing={1}
                                sx={{ backgroundColor: theme => theme.palette.secondary.main }}
                                alignItems={"center"}
                            >
                                <IconButton
                                    onClick={() => { handleDeselectBiosample() }}
                                >
                                    <CancelRounded />
                                </IconButton>
                                <Tooltip
                                    title={
                                        geneFilterVariables.selectedBiosample.length > 0 ? (
                                            <span>
                                                {geneFilterVariables.selectedBiosample.slice(0, 5).map((biosample) => (
                                                    <div key={biosample.displayname}>{biosample.displayname}</div>
                                                ))}
                                                {geneFilterVariables.selectedBiosample.length > 5 && (
                                                    <div>and {geneFilterVariables.selectedBiosample.length - 5} more...</div>
                                                )}
                                            </span>
                                        ) : "No biosamples selected"
                                    }
                                    arrow
                                    placement="right"
                                >
                                    <Stack direction={"row"} spacing={1}>
                                        <Typography
                                            sx={{ color: "#2C5BA0", pl: 1 }}>
                                            Selected Biosamples
                                        </Typography>
                                        <InfoOutlined />
                                    </Stack>
                                </Tooltip>
                            </Stack>
                        </Paper>
                    )}
                    <Accordion square disableGutters disabled={!geneFilterVariables.useGenes}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            Within a Biosample
                        </AccordionSummary>
                        <AccordionDetails>
                            <BiosampleTables
                                selected={geneFilterVariables.selectedBiosample?.map((sample) => sample.name)}
                                onChange={(biosample) => handleSelectedBiosample(biosample)}
                                assembly={"GRCh38"}
                                showRNAseq
                                preFilterBiosamples={(biosample) => biosample.rnaseq}
                                allowMultiSelect
                                showCheckboxes
                            />
                        </AccordionDetails>
                    </Accordion>
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
        </Accordion>
    )
}

export default GeneFilters;