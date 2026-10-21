import { useMemo } from "react";
import { Box } from "@mui/material";
import { LineChart } from "@mui/x-charts";
import { COLORS } from "@/lib/colors";
import { compassCategory } from "@/lib/regions/parse";
import { MainTableRow } from "@/types/rows";
import { buildPercentageSteps, movingAverage } from "./helpers";
import RankBand from "./RankBand";

const SAMPLES = 200;
const SMOOTHING_WINDOW = 7;
const DOMAIN_PAD = 0.01;

type CompassChartProps = {
    rows: MainTableRow[];
    loading: boolean;
    chartRef: React.RefObject<HTMLDivElement>;
};

/**
 * Share of pathogenic vs benign compass variants ranked at or above each rank,
 * with the user's regions marked on the band below.
 */
export default function CompassChart({ rows, loading, chartRef }: CompassChartProps) {
    const { xs, pathogenic, benign, min, max } = useMemo(() => {
        const ranked = rows.filter((r) => r.aggregateRank != null);
        const variants = ranked
            .map((r) => ({ rank: r.aggregateRank, type: compassCategory(r.regionID) }))
            .sort((a, b) => a.rank - b.rank);
        const ranks = ranked.map((r) => r.aggregateRank);
        const min = Math.min(...ranks);
        const max = Math.max(...ranks);

        const xs = Array.from({ length: SAMPLES }, (_, i) => min + (i / (SAMPLES - 1)) * (max - min));
        const { pathogenicPct, benignPct } = buildPercentageSteps(variants, xs);
        return {
            xs,
            pathogenic: movingAverage(pathogenicPct, SMOOTHING_WINDOW),
            benign: movingAverage(benignPct, SMOOTHING_WINDOW),
            min,
            max: max + (max - min) * DOMAIN_PAD,
        };
    }, [rows]);

    return (
        <Box ref={chartRef}>
            <LineChart
                loading={loading}
                xAxis={[{ data: xs, min, max }]}
                yAxis={[{ label: "Fraction of variants" }]}
                series={[
                    // legend-only entry for the white input region ticks on the band
                    { data: [], label: "Input Region", color: "white", showMark: false },
                    { data: loading ? [] : pathogenic, label: "Positive compass variant", color: COLORS.pathogenic, showMark: false },
                    { data: loading ? [] : benign, label: "Negative compass variant", color: COLORS.benign, showMark: false },
                ]}
                height={185}
                slotProps={{
                    tooltip: { trigger: "none" },
                    legend: { sx: { "& .MuiChartsLegend-mark": { stroke: "black", strokeWidth: 3 } } },
                }}
            />
            <RankBand rows={rows} loading={loading} min={min} max={max} />
        </Box>
    );
}
