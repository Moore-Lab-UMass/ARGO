'use client';
import { Box, Button, FormControl, FormGroup, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ElementFilterState, ElementTableRow, GeneFilterState, GeneTableRow, InputRegions, SequenceFilterState, SequenceTableRow } from "../../types";
import { useRef } from "react";
import { Download, InfoOutlined } from "@mui/icons-material";
import { downloadChart } from "../../_utility/downloads";
import { useCompassMainRows } from "../../hooks/useCompassMainRows";
import CompassChart from "./CompassChart";

interface CompassLayoutProps {
    regions: InputRegions;
    open: boolean;
    collection: string;
    setCollection: (collection: string) => void;
    sequenceRows: SequenceTableRow[];
    elementRows: ElementTableRow[];
    geneRows: GeneTableRow[];
    sequenceFilterVariables: SequenceFilterState;
    elementFilterVariables: ElementFilterState;
    geneFilterVariables: GeneFilterState;
    loadingScores: boolean;
}

const CompassLayout: React.FC<CompassLayoutProps> = ({ 
    regions,
    open, 
    collection, 
    setCollection,
    sequenceRows,
    elementRows,
    geneRows,
    sequenceFilterVariables,
    elementFilterVariables,
    geneFilterVariables,
    loadingScores
}) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const { mainRows, loading: loadingMainRows } = useCompassMainRows({
        regions,
        sequenceRows,
        elementRows,
        geneRows,
        sequenceFilterVariables,
        elementFilterVariables,
        geneFilterVariables,
        loadingScores,
    });

    return (
        <Box sx={{ p: 2, display: open ? "block" : "none" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip
                        title="Compass Collections are sets of functionally validated variants used as reference points. 
                    Your results are ranked against these variants to help guide analysis."
                        arrow
                        placement="top"
                    >
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                    <Typography fontWeight={600} mb={1}>
                        Compass Collection
                    </Typography>
                    <FormGroup>
                        <FormControl fullWidth>
                            <Select sx={{ height: "30px", width: "160px" }} value={collection} onChange={(event) => setCollection(event.target.value)}>
                                <MenuItem value={"Default"}>Default (50)</MenuItem>
                                <MenuItem value={"Inborn Genetic Diseases"}>Inborn Genetic Diseases (96)</MenuItem>
                                <MenuItem value={"Melanoma Pancreatic Cancer"}>Melanoma Pancreatic Cancer (71)</MenuItem>
                                <MenuItem value={"Primary Ciliary Dyskinesia"}>Primary Ciliary Dyskinesia (250)</MenuItem>
                                <MenuItem value={"Hereditary Breast Ovarian Cancer Syndrome"}>Hereditary Breast Ovarian Cancer Syndrome (230)</MenuItem>
                                <MenuItem value={"Spastic Paraplegia"}>Spastic Paraplegia (151)</MenuItem>
                            </Select>
                        </FormControl>
                    </FormGroup>
                </Stack>
                <Button
                    variant="outlined"
                    endIcon={<Download />}
                    sx={{ height: "30px" }}
                    onClick={() => downloadChart(chartRef.current, "compass_collection.png")}
                >
                    Download
                </Button>
            </Stack>
            <CompassChart rows={mainRows} loading={loadingMainRows} chartRef={chartRef} />
        </Box>
    )
}

export default CompassLayout;