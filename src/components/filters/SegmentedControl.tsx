import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

type SegmentedControlProps<T extends string> = {
    label: string;
    value: T;
    options: { value: T; label: string }[];
    onChange: (value: T) => void;
    disabled?: boolean;
};

/** A labelled row of exclusive options (e.g. Min / Max / Avg), styled for the navy filter sidebar. */
export default function SegmentedControl<T extends string>({ label, value, options, onChange, disabled }: SegmentedControlProps<T>) {
    return (
        <Stack gap={0.75}>
            <Typography sx={{ fontSize: 12, color: disabled ? "text.disabled" : "text.secondary" }}>{label}</Typography>
            <ToggleButtonGroup
                exclusive
                value={value}
                disabled={disabled}
                aria-label={label}
                onChange={(_, next: T | null) => next && onChange(next)}
                sx={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
                    gap: "3px",
                    p: "3px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(0,0,0,0.2)",
                    "& .MuiToggleButton-root": {
                        border: "none",
                        borderRadius: "5px !important",
                        m: "0 !important",
                        py: 0.75,
                        fontSize: 12,
                        textTransform: "none",
                        color: "text.secondary",
                    },
                    "& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover": {
                        backgroundColor: "#ffffff",
                        color: "background.default",
                        fontWeight: 700,
                    },
                    "& .MuiToggleButton-root.Mui-disabled.Mui-selected": { backgroundColor: "rgba(255,255,255,0.4)" },
                }}
            >
                {options.map((o) => (
                    <ToggleButton key={o.value} value={o.value}>
                        {o.label}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Stack>
    );
}
