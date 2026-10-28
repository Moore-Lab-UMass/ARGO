import { useMemo } from "react";
import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { TooltipWithBounds, useTooltip } from "@visx/tooltip";
import { COLORS } from "@/lib/colors";
import { compassCategory } from "@/lib/regions/parse";
import { MainTableRow } from "@/types/rows";
import { topKAccuracyFromRanks } from "./helpers";

const WIDTH = 710;
const BAND_HEIGHT = 14;
const TICK_HEIGHT = 18;
const OFFSET = 87; // aligns the band with the chart's x axis

const rankOrNA = (rank?: number) => (rank === 0 ? "N/A" : rank);

type RankBandProps = {
    rows: MainTableRow[];
    loading: boolean;
    min: number;
    max: number;
};

/** A band along the rank axis: white marks for the user's regions, green/grey ticks for compass variants. */
export default function RankBand({ rows, loading, min, max }: RankBandProps) {
    const { tooltipData, tooltipLeft, showTooltip, hideTooltip } = useTooltip<MainTableRow>();
    const scaleX = (rank: number) => ((rank - min) / (max - min)) * WIDTH;
    const topKAccuracy = useMemo(() => topKAccuracyFromRanks(rows), [rows]);

    const ranked = rows.filter((r) => r.aggregateRank != null);
    const byCategory = (category: ReturnType<typeof compassCategory>) => ranked.filter((r) => compassCategory(r.regionID) === category);

    const compassTick = (row: MainTableRow, fill: string) => {
        const hovered = tooltipData?.regionID === row.regionID;
        const x = scaleX(row.aggregateRank);
        return (
            <rect
                key={row.regionID}
                x={x}
                y={0}
                width={hovered ? 5 : 3}
                height={hovered ? TICK_HEIGHT + 2 : TICK_HEIGHT}
                rx={1}
                fill={fill}
                onMouseMove={() => showTooltip({ tooltipData: row, tooltipLeft: x, tooltipTop: 0 })}
                onMouseLeave={hideTooltip}
            />
        );
    };

    return (
        <Box width="100%" pl={`${OFFSET}px`} pr="15px">
            {loading ? (
                <Skeleton variant="rounded" width={WIDTH} height={BAND_HEIGHT} />
            ) : (
                <svg width={WIDTH + 10} height={TICK_HEIGHT}>
                    <rect x={0} y={2} width={WIDTH} height={BAND_HEIGHT} fill="black" stroke="black" />
                    {byCategory("input").map((row) => (
                        <rect key={row.regionID} x={scaleX(row.aggregateRank)} y={4.5} width={3} height={BAND_HEIGHT - 5} fill="white" />
                    ))}
                    {byCategory("benign").map((row) => compassTick(row, COLORS.benign))}
                    {/* pathogenic drawn last so it shows on top when ranks tie */}
                    {byCategory("pathogenic").map((row) => compassTick(row, COLORS.pathogenic))}
                </svg>
            )}
            {tooltipData && (
                <TooltipWithBounds top={285} left={tooltipLeft + 100}>
                    <div>
                        <strong>{String(tooltipData.regionID).split("_")[0]}</strong>
                    </div>
                    <br />
                    <div>Aggregate rank: {tooltipData.aggregateRank}</div>
                    <div>Sequence rank: {rankOrNA(tooltipData.sequenceRank)}</div>
                    <div>Element rank: {rankOrNA(tooltipData.elementRank)}</div>
                    <div>Gene rank: {rankOrNA(tooltipData.geneRank)}</div>
                </TooltipWithBounds>
            )}
            <Stack direction="row" justifyContent="space-between">
                <Typography>Rank</Typography>
                <Typography sx={{ mr: 3 }}>Top-k accuracy: {loading ? "--.-" : (topKAccuracy * 100).toFixed(1)}%</Typography>
            </Stack>
        </Box>
    );
}
