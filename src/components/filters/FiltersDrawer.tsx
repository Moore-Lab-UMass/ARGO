import { useMemo, useState } from "react";
import { Box, Drawer, IconButton, Stack, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Clear } from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { COLORS } from "@/lib/colors";
import { initialFilters, useFilterActions, useFilters } from "@/state/filters";
import ElementFilters from "./ElementFilters";
import GeneFilters from "./GeneFilters";
import SequenceFilters from "./SequenceFilters";

type Section = "sequence" | "element" | "gene";

type FiltersDrawerProps = {
    open: boolean;
    onToggle: () => void;
    width: string;
};

export default function FiltersDrawer({ open, onToggle, width }: FiltersDrawerProps) {
    const theme = useTheme();
    const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
    const filters = useFilters();
    const { reset } = useFilterActions();
    const [expanded, setExpanded] = useState<Section[]>([]);

    const filtersChanged = useMemo(() => JSON.stringify(filters) !== JSON.stringify(initialFilters), [filters]);

    const section = (name: Section) => ({
        expanded: expanded.includes(name),
        onToggle: () => setExpanded((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name])),
    });

    return (
        <Drawer
            anchor="left"
            open={open}
            onClose={onToggle}
            variant={isLargeScreen ? "persistent" : "temporary"}
            ModalProps={{ keepMounted: true }}
            sx={{
                "& .MuiDrawer-paper": {
                    position: isLargeScreen ? "absolute" : "fixed",
                    width: open ? width : 0,
                    height: "calc(100vh + 64px)",
                    backgroundColor: COLORS.panel,
                },
            }}
        >
            <Stack direction="row" justifyContent="space-between" padding={1} sx={{ borderBottom: "1px solid #ddd" }}>
                <Typography variant="h5" sx={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }} alignContent="center">
                    Filters
                </Typography>
                {filtersChanged && (
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>Clear Filters</Typography>
                        <IconButton onClick={reset}>
                            <Clear />
                        </IconButton>
                    </Stack>
                )}
                <IconButton color="primary" onClick={onToggle} style={{ transform: "rotate(90deg)" }}>
                    <ExpandMoreIcon />
                </IconButton>
            </Stack>
            <Box height="calc(100vh - 113px)" overflow="auto">
                <SequenceFilters {...section("sequence")} />
                <ElementFilters {...section("element")} />
                <GeneFilters {...section("gene")} />
            </Box>
        </Drawer>
    );
}
