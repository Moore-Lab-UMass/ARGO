"use client";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";
import FiltersDrawer from "@/components/filters/FiltersDrawer";
import SubmissionHeader from "@/components/layout/SubmissionHeader";
import ResultsTables from "@/components/results/ResultsTables";
import { loadSubmission } from "@/lib/regions/session";
import { FiltersProvider } from "@/state/filters";
import { InputRegion } from "@/types/regions";

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
            <Stack direction="row" flexGrow={1}>
                <FiltersDrawer open={drawerOpen} onToggle={toggleDrawer} />
                <Box sx={{ flexGrow: 1, minWidth: 0, p: 3, zIndex: 1 }}>
                    <SubmissionHeader
                        fileName={submission.fileName}
                        regionCount={submission.regions.length}
                        drawerOpen={drawerOpen}
                        toggleDrawer={toggleDrawer}
                    />
                    <ResultsTables regions={submission.regions} />
                </Box>
            </Stack>
        </FiltersProvider>
    );
}
