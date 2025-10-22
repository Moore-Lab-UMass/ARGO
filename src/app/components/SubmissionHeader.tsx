import React from "react";
import { Stack, Typography, Button, IconButton, useMediaQuery } from "@mui/material";
import Link from "next/link";
import FilterListIcon from "@mui/icons-material/FilterList";
import RestorePageIcon from "@mui/icons-material/RestorePage";
import { useTheme } from "@mui/material/styles";

interface SubmissionHeaderProps {
    fileName: string | null;
    toggleDrawer: () => void;
    drawerOpen: boolean;
}

const SubmissionHeader: React.FC<SubmissionHeaderProps> = ({ fileName, drawerOpen, toggleDrawer }) => {
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down("sm")); // true for xs/sm

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
                {!drawerOpen && (
                    <IconButton onClick={toggleDrawer} color="primary">
                        <FilterListIcon />
                    </IconButton>
                )}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        backgroundColor: theme.palette.secondary.main,
                        padding: 1,
                    }}
                    borderRadius={1}
                >
                    <Typography>Uploaded:</Typography>
                    <Typography>{fileName}</Typography>
                </Stack>
            </Stack>

            {isSmall ? (
                <IconButton
                    color={"primary"}
                    LinkComponent={Link}
                    href="/"
                    sx={{height: 40,}}
                >
                    <RestorePageIcon />
                </IconButton>
            ) : (
                <Button
                    variant="outlined"
                    LinkComponent={Link}
                    href="/"
                    sx={{height: 40}}
                >
                    New Submission
                </Button>
            )}
        </Stack>
    );
};

export default SubmissionHeader;
