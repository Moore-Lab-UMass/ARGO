import { ReactNode } from "react";
import { Box, ButtonBase, Collapse, Stack, Switch, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined } from "@mui/icons-material";
import { RADIUS } from "@/app/theme";
import { CATEGORY_COLORS, RankCategory } from "@/lib/colors";

type FilterAccordionProps = {
    category: RankCategory;
    info: string;
    /** Whether this category is used in the ranking (the on/off switch) */
    enabled: boolean;
    onEnabledChange: (enabled: boolean) => void;
    /** One-line description of the current settings, shown while collapsed */
    summary: string;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
};

/** One collapsible section of the filter sidebar (Sequence, Elements, Genes), with an on/off switch. */
export default function FilterAccordion({
    category,
    info,
    enabled,
    onEnabledChange,
    summary,
    expanded,
    onToggle,
    children,
}: FilterAccordionProps) {
    const { label, onNavy } = CATEGORY_COLORS[category];
    const contentId = `filters-${category}`;

    return (
        <Box
            component="section"
            sx={{
                backgroundColor: expanded ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.04)",
                borderRadius: `${RADIUS}px`,
            }}
        >
            <Stack direction="row" alignItems="center" pr={1}>
                <ButtonBase
                    onClick={onToggle}
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    sx={{
                        flexGrow: 1,
                        minWidth: 0,
                        justifyContent: "flex-start",
                        textAlign: "left",
                        gap: 1.25,
                        p: 1.75,
                        minHeight: 56,
                        borderRadius: `${RADIUS}px`,
                    }}
                >
                    <Box sx={{ width: 10, height: 10, borderRadius: "3px", flexShrink: 0, backgroundColor: onNavy }} />
                    <Stack flexGrow={1} minWidth={0} gap={0.25}>
                        <Stack direction="row" alignItems="center" gap={0.75}>
                            <Typography component="h3" sx={{ fontSize: 14, fontWeight: 600 }}>
                                {label}
                            </Typography>
                            <Tooltip arrow placement="right-end" title={info}>
                                <InfoOutlined sx={{ fontSize: 15, color: "text.secondary" }} />
                            </Tooltip>
                        </Stack>
                        {!expanded && (
                            <Typography noWrap sx={{ fontSize: 12, color: "text.secondary" }}>
                                {enabled ? summary : "Not used in ranking"}
                            </Typography>
                        )}
                    </Stack>
                    <ExpandMore
                        sx={{
                            color: "text.secondary",
                            transition: "transform 150ms",
                            transform: expanded ? "rotate(180deg)" : "none",
                        }}
                    />
                </ButtonBase>
                <Switch
                    size="small"
                    checked={enabled}
                    onChange={(_, checked) => onEnabledChange(checked)}
                    slotProps={{ input: { "aria-label": `Use ${label.toLowerCase()} in ranking` } }}
                    sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": { color: "#ffffff" },
                        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: onNavy, opacity: 1 },
                    }}
                />
            </Stack>
            <Collapse in={expanded} id={contentId}>
                <Stack gap={1} sx={{ px: 1.75, pb: 1.75 }}>
                    {children}
                </Stack>
            </Collapse>
        </Box>
    );
}
