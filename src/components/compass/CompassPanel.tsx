"use client";
import { useMemo, useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, Divider, FormControl, IconButton, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { Download, InfoOutlined } from "@mui/icons-material";
import { useCategoryRows } from "@/hooks/useCategoryRows";
import { useCompassRegions } from "@/hooks/useCompassRegions";
import { COMPASS_COLLECTIONS } from "@/lib/constants";
import { downloadChart, downloadCollectionFile } from "@/lib/downloads";
import { CategoryRows, concatRows, rankRegions } from "@/lib/ranking/pipeline";
import { useFilters } from "@/state/filters";
import { InputRegion } from "@/types/regions";
import CompassChart from "./CompassChart";

export type CompassPanelProps = {
    collection: string;
    onCollectionChange: (collection: string) => void;
    /** The user's regions and rows, ranked together with the compass variants */
    pageRegions: InputRegion[];
    pageRows: CategoryRows;
    loadingPage: boolean;
};

/**
 * Ranks the user's regions together with a compass collection (known pathogenic and benign
 * variants) to show where the user's regions fall relative to them.
 */
export default function CompassPanel({ collection, onCollectionChange, pageRegions, pageRows, loadingPage }: CompassPanelProps) {
    const filters = useFilters();
    const [downloadOpen, setDownloadOpen] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);

    const { regions: compassRegions } = useCompassRegions(collection);
    const compass = useCategoryRows(compassRegions, filters, { keepPartialSequence: true });

    const mainRows = useMemo(() => {
        const regions = [...pageRegions, ...compassRegions];
        return rankRegions(regions, concatRows(pageRows, compass.rows), filters).mainRows;
    }, [pageRegions, compassRegions, pageRows, compass.rows, filters]);

    const anyCategory = filters.sequence.useConservation || filters.sequence.useMotifs || filters.element.usecCREs || filters.gene.useGenes;
    const loading = anyCategory && (compass.loading.any || loadingPage);

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip
                        title="Compass Collections are sets of functionally validated variants used as reference points. Your results are ranked against these variants to help guide analysis."
                        arrow
                        placement="top"
                    >
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                    <Typography fontWeight={600} mb={1}>
                        Compass Collection
                    </Typography>
                    <FormControl>
                        <Select sx={{ height: "30px", width: "160px" }} value={collection} onChange={(e) => onCollectionChange(e.target.value)}>
                            {Object.entries(COMPASS_COLLECTIONS).map(([name, { count }]) => (
                                <MenuItem key={name} value={name}>
                                    {name} ({count})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <Button variant="outlined" endIcon={<Download />} sx={{ height: "30px" }} onClick={() => setDownloadOpen(true)}>
                    Download
                </Button>
            </Stack>
            <CompassChart rows={mainRows} loading={loading} chartRef={chartRef} />
            <Dialog open={downloadOpen} onClose={() => setDownloadOpen(false)} maxWidth="xs">
                <DialogContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography>Download chart</Typography>
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
                    <Button onClick={() => setDownloadOpen(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
