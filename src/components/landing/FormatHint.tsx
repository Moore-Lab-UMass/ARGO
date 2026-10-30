import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { MONO_FONT } from "@/app/theme";
import { BRAND } from "@/lib/colors";

export type FormatChip = {
    label: string;
    tooltip?: string;
    optional?: boolean;
    /** Highlights the chip, e.g. when that column failed validation */
    error?: boolean;
};

/** A small caption plus monospace chips describing the expected input format. */
export default function FormatHint({ title, chips }: { title: string; chips: FormatChip[] }) {
    return (
        <Box>
            <Typography
                sx={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "text.secondary", mb: 1 }}
            >
                {title}
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
                {chips.map(({ label, tooltip, optional, error }) => (
                    <Tooltip key={label} title={tooltip ?? ""} arrow disableInteractive>
                        <Box
                            component="span"
                            sx={{
                                fontFamily: MONO_FONT,
                                fontSize: 13,
                                px: 1.25,
                                py: 0.5,
                                borderRadius: 1.5,
                                border: "1px dashed",
                                borderColor: error ? "error.main" : optional ? "#cfd6e2" : "transparent",
                                backgroundColor: error ? "#fdecec" : optional ? "transparent" : BRAND.track,
                                color: error ? "error.dark" : optional ? "text.secondary" : "text.primary",
                                cursor: tooltip ? "help" : "default",
                            }}
                        >
                            {label}
                        </Box>
                    </Tooltip>
                ))}
            </Stack>
        </Box>
    );
}
