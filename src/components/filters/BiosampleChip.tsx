import { IconButton, Paper, Stack, Typography } from "@mui/material";
import { CancelRounded } from "@mui/icons-material";
import { COLORS } from "@/lib/colors";

type BiosampleChipProps = {
    label: string;
    onClear: () => void;
    /** Makes the chip clickable (e.g. to reopen the selection dialog) */
    onClick?: () => void;
};

/** Shows the selected biosample with a button to clear it. */
export default function BiosampleChip({ label, onClear, onClick }: BiosampleChipProps) {
    return (
        <Paper elevation={0} sx={{ width: "fit-content", cursor: onClick ? "pointer" : undefined }} onClick={onClick}>
            <Stack
                borderRadius={1}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                sx={{ backgroundColor: (theme) => theme.palette.secondary.main }}
            >
                <Typography sx={{ color: COLORS.chipText, pl: 1 }}>{label}</Typography>
                <IconButton
                    sx={{ zIndex: 10 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onClear();
                    }}
                >
                    <CancelRounded />
                </IconButton>
            </Stack>
        </Paper>
    );
}
