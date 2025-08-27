import React, { useEffect, useMemo, useState } from "react";
import { GeneAccordianProps, GeneLinkingMethod } from "../../types";
import { Accordion, AccordionDetails, AccordionSummary, Button, Checkbox, FormControl, FormControlLabel, FormGroup, Grid2, IconButton, MenuItem, Modal, Paper, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined, CancelRounded } from "@mui/icons-material"
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import CloseIcon from '@mui/icons-material/Close';
import { COMPUTATIONAL_CELL_TYPES_QUERY, LINKED_GENES_CELL_TYPES_QUERY } from "../../queries";
import { useQuery } from "@apollo/client";

const GeneFilters: React.FC<GeneAccordianProps> = ({
    geneFilterVariables,
    updateGeneFilter,
    isExpanded,
    handleAccordionChange
}) => {
    const [open, setOpen] = useState(false);

    const { data } = useQuery(LINKED_GENES_CELL_TYPES_QUERY, {
        variables: {
            biosample_value: geneFilterVariables.selectedBiosample ? geneFilterVariables.selectedBiosample.map(b => b.name) : []
        },
        skip: !geneFilterVariables.selectedBiosample,
    });

    const { data: computationalData } = useQuery(COMPUTATIONAL_CELL_TYPES_QUERY, {
        variables: {
            biosample_value: geneFilterVariables.selectedBiosample ? geneFilterVariables.selectedBiosample.map(b => b.name) : []
        },
        skip: !geneFilterVariables.selectedBiosample,
    });

    const availableMethods: Set<GeneLinkingMethod> = useMemo(() => {
        if (!data && !computationalData) return;
        const methods = new Set<GeneLinkingMethod>();
        data?.getLinkedGenesCelltypesByAssay.forEach((item) => {
            methods.add(item.assay.replace("-", "_") as GeneLinkingMethod);
        });
        computationalData?.getCompuLinkedGenesCelltypes.forEach((item) => {
            methods.add(item.method as GeneLinkingMethod);
        });
        return methods;
    }, [computationalData, data]);

    //change assays and availible assays depending on if there is a biosample selected or not
    const handleSelectedBiosample = (biosample) => {
        updateGeneFilter("selectedBiosample", biosample)
    }

    const handleDeselectBiosample = () => {
        updateGeneFilter("selectedBiosample", null);
        updateGeneFilter("methodOfLinkage", "distance");
    }

    useEffect(() => {
        if (geneFilterVariables.selectedBiosample?.length === 0) {
            updateGeneFilter("selectedBiosample", null);
            updateGeneFilter("methodOfLinkage", "distance");
        }
    }, [geneFilterVariables.selectedBiosample, updateGeneFilter])

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
                    <Grid2 container sx={{ mb: 2 }} spacing={2} alignItems={"flex-end"}>
                        <Grid2 size={6}>
                            <FormControl
                                fullWidth
                                disabled={!geneFilterVariables.useGenes}
                            >
                                <Typography>Method of Linkage</Typography>
                                <Select
                                    value={geneFilterVariables.methodOfLinkage}
                                    onChange={(event) => {
                                        updateGeneFilter("methodOfLinkage", event.target.value as GeneLinkingMethod)
                                    }}
                                    size="small"
                                >
                                    {/* Distance is always available, no tooltip needed */}
                                    <MenuItem value="distance">Distance</MenuItem>
                                    {/* Helper for tooltip logic */}
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
                                        const isBiosampleNull = geneFilterVariables.selectedBiosample === null;
                                        const isDisabled = !availableMethods?.has(item.value as GeneLinkingMethod);

                                        let tooltip = "";
                                        if (isBiosampleNull) {
                                            tooltip = "Select a biosample to include other gene linking methods";
                                        } else if (isDisabled) {
                                            tooltip = "Gene linking method not available in selected biosample";
                                        }

                                        const menuItem = (
                                            <MenuItem
                                                key={item.value}
                                                value={item.value}
                                                disabled={isDisabled}
                                                style={isDisabled ? { pointerEvents: "none" } : {}}
                                            >
                                                {item.label}
                                            </MenuItem>
                                        );

                                        // Only wrap in Tooltip if there is a tooltip message
                                        return tooltip ? (
                                            <Tooltip key={item.value} title={tooltip} placement="right" arrow>
                                                <span>{menuItem}</span>
                                            </Tooltip>
                                        ) : (
                                            menuItem
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid2>
                        <Grid2 size={6}>
                            {geneFilterVariables.selectedBiosample && (
                                <Paper elevation={0}>
                                    <Stack
                                        borderRadius={1}
                                        direction={"row"}
                                        sx={{ backgroundColor: theme => theme.palette.secondary.main }}
                                        alignItems={"center"}
                                        justifyContent={"space-between"}
                                    >
                                        <IconButton
                                            onClick={() => { handleDeselectBiosample() }}
                                            size="small"
                                        >
                                            <CancelRounded />
                                        </IconButton>
                                        <Typography
                                            sx={{ color: "#2C5BA0", pl: 1 }}>
                                            Selected
                                        </Typography>
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

                                            <InfoOutlined />
                                        </Tooltip>
                                    </Stack>
                                </Paper>
                            )}
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ height: "40px" }}
                                onClick={() => setOpen(true)}
                                disabled={!geneFilterVariables.useGenes}
                            >
                                Within a Biosample
                            </Button>
                        </Grid2>
                    </Grid2>
                    <FormControl disabled={!geneFilterVariables.useGenes}>
                        <Typography>Rank Expression Specificity By</Typography>
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
                        selected={geneFilterVariables.selectedBiosample?.map((sample) => sample.name)}
                        onChange={(biosample) => handleSelectedBiosample(biosample)}
                        assembly={"GRCh38"}
                        showRNAseq
                        preFilterBiosamples={(biosample) => biosample.rnaseq}
                        allowMultiSelect
                        showCheckboxes
                    />
                </Paper>
            </Modal>
        </Accordion>
    )
}

export default GeneFilters;