import { useMemo, useState } from "react";
import { Box, Button, Drawer, IconButton, Stack, ThemeProvider, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material";
import KeyboardDoubleArrowLeft from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { sidebarTheme } from "@/app/theme";
import { HEADER_HEIGHT } from "@/components/layout/Header";
import { BRAND } from "@/lib/colors";
import { initialFilters } from "@/state/filterReducer";
import { useFilterActions, useFilters } from "@/state/filters";
import ElementFilters from "./ElementFilters";
import GeneFilters from "./GeneFilters";
import SequenceFilters from "./SequenceFilters";

type Section = "sequence" | "element" | "gene";

/** Sidebar width in px */
export const FILTERS_WIDTH = 320;

type FiltersDrawerProps = {
    open: boolean;
    onToggle: () => void;
};

/**
 * Navy filter sidebar. On large screens it is a full-height column beside the results
 * (its contents stick under the header while the page scrolls); on smaller screens it is a slide-out drawer.
 */
export default function FiltersDrawer({ open, onToggle }: FiltersDrawerProps) {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

    const panel = (
        <ThemeProvider theme={sidebarTheme}>
            <FiltersPanel onHide={onToggle} />
        </ThemeProvider>
    );

    if (!isLargeScreen) {
        return (
            <Drawer
                anchor="left"
                open={open}
                onClose={onToggle}
                ModalProps={{ keepMounted: true }}
                slotProps={{ paper: { sx: { width: FILTERS_WIDTH, maxWidth: "90vw", backgroundColor: BRAND.sidebar } } }}
            >
                {panel}
            </Drawer>
        );
    }

    if (!open) return null;
    return (
        <Box component="aside" aria-label="Filters" sx={{ width: FILTERS_WIDTH, flexShrink: 0, backgroundColor: BRAND.sidebar }}>
            <Box sx={{ position: "sticky", top: 0, maxHeight: `calc(100vh - ${HEADER_HEIGHT}px)`, overflowY: "auto" }}>
                {panel}
            </Box>
        </Box>
    );
}

function FiltersPanel({ onHide }: { onHide: () => void }) {
    const filters = useFilters();
    const { reset } = useFilterActions();
    const [expanded, setExpanded] = useState<Section[]>(["sequence"]);

    const filtersChanged = useMemo(() => JSON.stringify(filters) !== JSON.stringify(initialFilters), [filters]);

    const section = (name: Section) => ({
        expanded: expanded.includes(name),
        onToggle: () => setExpanded((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name])),
    });

    return (
        <Stack gap={1} sx={{ px: 1.5, py: 2, color: "text.primary" }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1, pb: 1 }}>
                <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>
                    Filters
                </Typography>
                <Stack direction="row" alignItems="center" gap={0.5}>
                    <Button
                        size="small"
                        onClick={reset}
                        disabled={!filtersChanged}
                        sx={{ color: "#ffffff", textDecoration: "underline", fontWeight: 400, minWidth: 0 }}
                    >
                        Reset
                    </Button>
                    <Tooltip title="Hide filters">
                        <IconButton
                            onClick={onHide}
                            aria-label="Hide filters"
                            size="small"
                            sx={{ border: "1px solid rgba(255,255,255,0.25)", borderRadius: "6px", color: "#ffffff" }}
                        >
                            <KeyboardDoubleArrowLeft fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Stack>
            <SequenceFilters {...section("sequence")} />
            <ElementFilters {...section("element")} />
            <GeneFilters {...section("gene")} />
            <Typography sx={{ px: 1, pt: 1, fontSize: 12, color: "text.secondary" }}>Results re-rank as you change filters.</Typography>
        </Stack>
    );
}
