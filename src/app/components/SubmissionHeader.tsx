import React from "react";
import { Stack, Typography, Button } from "@mui/material";
import Link from "next/link";

interface SubmissionHeaderProps {
  fileName: string | null;
}

const SubmissionHeader: React.FC<SubmissionHeaderProps> = ({ fileName }) => {
    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={(theme) => ({
                    backgroundColor: theme.palette.secondary.main,
                    padding: 1,
                })}
                borderRadius={1}
            >
                <Typography mb={1} variant="h6">
                    Uploaded:
                </Typography>
                <Typography>{fileName}</Typography>
            </Stack>

            <Button
                variant="outlined"
                LinkComponent={Link}
                href="/"
                sx={{ height: 48 }}
            >
                New Submission
            </Button>
        </Stack>
    );
};

export default SubmissionHeader;
