"use client";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import SubmissionHeader from "@/components/layout/SubmissionHeader";
import ResultsTables from "@/components/results/ResultsTables";
import { loadSubmission } from "@/lib/regions/session";
import { FiltersProvider } from "@/state/filters";
import { InputRegion } from "@/types/regions";

const FILTERS_WIDTH = "25vw";
const HEADER_HEIGHT = 64;

/** Results page: the submitted regions are read from sessionStorage (see lib/regions/session.ts). */
export default function ResultsPage() {
    const [submission, setSubmission] = useState<{ regions: InputRegion[]; fileName: string | null }>({
        regions: [],
        fileName: null,
    });
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen((open) => !open);

    // sessionStorage only exists in the browser, so read it after mount
    useEffect(() => {
        const saved = loadSubmission();
        if (saved) setSubmission(saved);
    }, []);

    return (
        <FiltersProvider>
            <Stack direction="row" height="100%">
                <Box
                    id="filters-wrapper"
                    sx={{
                        position: "sticky",
                        top: 0,
                        width: drawerOpen ? FILTERS_WIDTH : 0,
                        height: `calc(100vh + ${HEADER_HEIGHT}px)`,
                    }}
                >
                    <FiltersDrawer open={drawerOpen} onToggle={toggleDrawer} width={FILTERS_WIDTH} />
                </Box>
                <Box sx={{ flexGrow: 1, height: "100%", minWidth: 0, padding: 3, zIndex: 1 }}>
                    <SubmissionHeader fileName={submission.fileName} drawerOpen={drawerOpen} toggleDrawer={toggleDrawer} />
                    <ResultsTables regions={submission.regions} />
                </Box>
            </Stack>
        </FiltersProvider>
    );
}
