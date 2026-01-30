import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { MainTableRow } from "../../types";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { useMemo } from "react";
import { topKAccuracyFromRanks } from "./helpers";

interface RankBandProps {
    rows: MainTableRow[];
    loading: boolean;
    min: number;
    max: number;
}

const RankBand: React.FC<RankBandProps> = ({ rows, loading, min, max }) => {
    const width = 710;
    const bandHeight = 14;
    const tickHeight = 18;
    const offset = 83

    const {
        tooltipData,
        tooltipLeft,
        showTooltip,
        hideTooltip,
    } = useTooltip<MainTableRow>();

    const scaleX = (rank: number) =>
        ((rank - min) / (max - min)) * width;

    const topKAccuracy = useMemo(
        () => topKAccuracyFromRanks(rows),
        [rows]
    );

    return (
        <Box width="100%" pl={`${offset}px`} pr={"15px"}>
            {loading ? (
                <Skeleton variant="rounded" width={width} height={bandHeight} />
            ) : (
                <svg width={width + 10} height={tickHeight}>
                    {/* black band */}
                    <rect
                        x={0}
                        y={2}
                        width={width}
                        height={bandHeight}
                        fill="black"
                        stroke="black"
                    />

                    {/* Input ticks */}
                    {rows.map(row => {
                        const category = String(row.regionID).split("_")[0];
                        if (
                            row.aggregateRank == null ||
                            category === "Benign" || category === "Pathogenic"
                        ) {
                            return null;
                        }
                        const x = scaleX(row.aggregateRank);

                        return (
                            <rect
                                key={row.regionID}
                                x={x}
                                y={4.5}
                                width={3}
                                height={bandHeight - 5}
                                fill="white"
                            />
                        );
                    })}

                    {/* benign ticks */}
                    {rows.map(row => {
                        const category = String(row.regionID).split("_")[0];
                        if (
                            row.aggregateRank == null ||
                            category !== "Benign"
                        ) {
                            return null;
                        }

                        const hoveredRow =
                            tooltipData && tooltipData.regionID === row.regionID;
                        const x = scaleX(row.aggregateRank);

                        return (
                            <rect
                                key={row.regionID}
                                x={x}
                                y={0}
                                width={hoveredRow ? 5 : 3}
                                height={hoveredRow ? tickHeight + 2 : tickHeight}
                                rx={1}
                                fill="grey"
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

                    {/* Render pathogenic on top in case of tie */}
                    {rows.map(row => {
                        const category = String(row.regionID).split("_")[0];
                        if (
                            row.aggregateRank == null ||
                            category !== "Pathogenic"
                        ) {
                            return null;
                        }

                        const hoveredRow =
                            tooltipData && tooltipData.regionID === row.regionID;
                        const x = scaleX(row.aggregateRank);

                        return (
                            <rect
                                key={row.regionID}
                                x={x}
                                y={0}
                                width={hoveredRow ? 5 : 3}
                                height={hoveredRow ? tickHeight + 2 : tickHeight}
                                rx={1}
                                fill="#1fa718"
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
                    <br />
                    <div>Aggregate rank: {tooltipData.aggregateRank}</div>
                    <div>Sequence rank: {tooltipData.sequenceRank === 0 ? "N/A" : tooltipData.sequenceRank}</div>
                    <div>Element rank: {tooltipData.elementRank === 0 ? "N/A" : tooltipData.elementRank}</div>
                    <div>Gene rank: {tooltipData.geneRank === 0 ? "N/A" : tooltipData.geneRank}</div>
                </TooltipWithBounds>
            )}
            <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography>Rank</Typography>
                <Typography sx={{ mr: 3 }}>
                    Top-k accuracy: {loading ? `--.-` : (topKAccuracy * 100).toFixed(1)}%
                </Typography>
            </Stack>
        </Box>
    );
}

export default RankBand