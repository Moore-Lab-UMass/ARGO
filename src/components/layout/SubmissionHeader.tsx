import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";

interface SubmissionHeaderProps {
    fileName: string | null;
    regionCount: number;
    toggleDrawer: () => void;
    drawerOpen: boolean;
}

/** Title row of the results page: the uploaded file's name, and a button to start a new submission. */
const SubmissionHeader: React.FC<SubmissionHeaderProps> = ({ fileName, regionCount, drawerOpen, toggleDrawer }) => {
    return (
        <Stack direction="row" flexWrap="wrap" justifyContent="space-between" alignItems="flex-end" gap={1.5} mb={2.5}>
            <Stack direction="row" alignItems="flex-end" gap={2}>
                {!drawerOpen && (
                    <Button variant="outlined" startIcon={<FilterListIcon />} onClick={toggleDrawer} sx={{ backgroundColor: "background.paper" }}>
                        Filters
                    </Button>
                )}
                <Box>
                    <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 0.5 }}>Uploaded</Typography>
                    <Typography component="h1" sx={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em", wordBreak: "break-word" }}>
                        {fileName}{" "}
                        <Box component="span" sx={{ fontSize: 14, fontWeight: 500, color: "text.secondary" }}>
                            · {regionCount} {regionCount === 1 ? "region" : "regions"}
                        </Box>
                    </Typography>
                </Box>
            </Stack>
            <Button variant="contained" LinkComponent={Link} href="/" startIcon={<AddIcon />}>
                New submission
            </Button>
        </Stack>
    );
};

export default SubmissionHeader;
