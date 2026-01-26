import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { MainTableRow } from "../../types";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";

interface RankBandProps {
    rows: MainTableRow[];
    loading: boolean;
}

const RankBand: React.FC<RankBandProps> = ({ rows, loading }) => {
    const width = 715;
    const bandHeight = 14;
    const tickHeight = 18;
    const offset = 83

    const {
        tooltipData,
        tooltipLeft,
        showTooltip,
        hideTooltip,
    } = useTooltip<MainTableRow>();

    const ranks = rows
        .map(r => r.aggregateRank)
        .filter((r): r is number => r != null);

    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);

    const scaleX = (rank: number) =>
        ((rank - minRank) / (maxRank - minRank)) * width;

    return (
        <Box width="100%" pl={`${offset}px`} pr={"15px"}>
            {loading ? (
                <Skeleton variant="rounded" width={width} height={bandHeight} />
            ) : (
                <svg width={width} height={tickHeight}>
                    {/* black band */}
                    <rect
                        x={0}
                        y={2}
                        width={width}
                        height={bandHeight}
                        fill="black"
                    />

                    {/* ticks */}
                    {rows.map(row => {
                        const category = String(row.regionID).split("_")[0];
                        if (
                            row.aggregateRank == null ||
                            (category !== "Benign" && category !== "Pathogenic")
                        ) {
                            return null;
                        }

                        const hoveredRow = tooltipData && tooltipData.regionID === row.regionID;
                        const x = scaleX(row.aggregateRank);

                        return (
                            <rect
                                key={row.regionID}
                                x={scaleX(row.aggregateRank)}
                                y={0}
                                width={hoveredRow ? 5 : 3}
                                height={hoveredRow ? tickHeight + 2 : tickHeight}
                                rx={1}
                                fill={category === "Pathogenic" ? "grey" : "green"}
                                onMouseMove={() =>
                                    showTooltip({
                                        tooltipData: row,
                                        tooltipLeft: x,
                                        tooltipTop: 0,
                                    })
                                }
                                onMouseLeave={hideTooltip}
                            />

                        );
                    })}
                </svg>
            )}
            {tooltipData && (
                <TooltipWithBounds
                    top={285}
                    left={tooltipLeft + 100}
                >
                    <div>
                        <strong>{String(tooltipData.regionID).split("_")[0]}</strong>
                    </div>
                    <br/>
                    <div>Aggregate rank: {tooltipData.aggregateRank}</div>
                    <div>Sequence rank: {tooltipData.sequenceRank}</div>
                    <div>Element rank: {tooltipData.elementRank}</div>
                    <div>Gene rank: {tooltipData.geneRank}</div>
                </TooltipWithBounds>
            )}
            <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography>Rank</Typography>
                <Typography sx={{ mr: 3 }}>Top k-accuracy: 71.4%</Typography>
            </Stack>
        </Box>
    );
}

export default RankBand