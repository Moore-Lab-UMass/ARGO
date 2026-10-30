"use client";
import { Box, IconButton, Tooltip } from "@mui/material";
import { useColorScheme } from "@mui/material/styles";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";

const SIZE = 40;

/** Switches between light and dark mode. Starts from the system setting; a click saves the choice. */
export default function ThemeToggle() {
    const { mode, systemMode, setMode } = useColorScheme();

    // The mode is only known in the browser; keep the space so the header doesn't shift
    if (!mode) return <Box width={SIZE} height={SIZE} />;

    const isDark = (mode === "system" ? systemMode : mode) === "dark";
    const label = isDark ? "Switch to light mode" : "Switch to dark mode";

    return (
        <Tooltip title={label}>
            <IconButton aria-label={label} onClick={() => setMode(isDark ? "light" : "dark")} sx={{ width: SIZE, height: SIZE, color: "text.primary" }}>
                {isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
            </IconButton>
        </Tooltip>
    );
}
