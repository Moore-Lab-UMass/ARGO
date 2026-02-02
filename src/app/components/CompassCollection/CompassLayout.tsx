'use client';
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, FormControl, FormGroup, IconButton, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { ElementFilterState, ElementTableRow, GeneFilterState, GeneTableRow, InputRegions, SequenceFilterState, SequenceTableRow } from "../../types";
import { useRef, useState } from "react";
import { Download, InfoOutlined } from "@mui/icons-material";
import { downloadChart, downloadCollectionFile } from "../../_utility/downloads";
import { useCompassMainRows } from "../../hooks/useCompassMainRows";
import CompassChart from "./CompassChart";
import { collectionFileMap } from "../../hooks/useCompassRegions";

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
    const [downloadOpen, setDownloadOpen] = useState(false);
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
                            <Select
                                sx={{ height: "30px", width: "160px" }}
                                value={collection}
                                onChange={(event) => setCollection(event.target.value)}
                            >
                                {Object.entries(collectionFileMap).map(
                                    ([name, { count }]) => (
                                        <MenuItem key={name} value={name}>
                                            {name} ({count})
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>
                    </FormGroup>
                </Stack>
                <Button
                    variant="outlined"
                    endIcon={<Download />}
                    sx={{ height: "30px" }}
                    onClick={() => setDownloadOpen(true)}
                >
                    Download
                </Button>
            </Stack>
            <CompassChart rows={mainRows} loading={loadingMainRows} chartRef={chartRef} />
            <Dialog
                open={downloadOpen}
                onClose={() => setDownloadOpen(false)}
                maxWidth="xs"
            >
                <DialogContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography>
                                Download <i>{collection}</i> collection data
                            </Typography>
                            <IconButton
                                onClick={() => {
                                    downloadCollectionFile(collection);
                                    setDownloadOpen(false);
                                }}
                            >
                                <Download />
                            </IconButton>
                        </Stack>
                        <Divider />
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography>
                                Download chart
                            </Typography>
                            <IconButton
                                onClick={() => {
                                    downloadChart(chartRef.current, "compass_collection.png");
                                    setDownloadOpen(false);
                                }}
                            >
                                <Download />
                            </IconButton>
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ pr: 2, pb: 2 }}>
                    <Button onClick={() => setDownloadOpen(false)}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}

export default CompassLayout;