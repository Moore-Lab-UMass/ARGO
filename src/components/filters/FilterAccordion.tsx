import { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined } from "@mui/icons-material";
import { COLORS } from "@/lib/colors";

type FilterAccordionProps = {
    title: string;
    info: string;
    expanded: boolean;
    onToggle: () => void;
    children: ReactNode;
};

/** One collapsible section of the filter drawer (Sequence, Elements, Genes). */
export default function FilterAccordion({ title, info, expanded, onToggle, children }: FilterAccordionProps) {
    const color = expanded ? COLORS.accent : "inherit";
    return (
        <Accordion square disableGutters expanded={expanded} onChange={onToggle} sx={{ backgroundColor: COLORS.panel }}>
            <AccordionSummary expandIcon={<ExpandMore sx={{ color }} />}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                        sx={{
                            color,
                            fontSize: expanded ? "large" : "normal",
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                    >
                        {title}
                    </Typography>
                    <Tooltip arrow placement="right-end" title={info}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>{children}</AccordionDetails>
        </Accordion>
    );
}
