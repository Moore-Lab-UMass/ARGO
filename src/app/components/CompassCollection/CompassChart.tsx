import { LineChart } from "@mui/x-charts";
import { MainTableRow } from "../../types";
import RankBand from "./RankBand";
import { cumulativeKDE } from "./helpers";
import { Box } from "@mui/material";

interface RankBandProps {
    rows: MainTableRow[];
    loading: boolean;
    chartRef: React.RefObject<HTMLDivElement>;
}

const CompassChart: React.FC<RankBandProps> = ({ rows, loading, chartRef }) => {

    const benignRanks = rows
        .filter(r =>
            r.aggregateRank != null &&
            String(r.regionID).startsWith("Benign")
        )
        .map(r => r.aggregateRank as number);

    const pathogenicRanks = rows
        .filter(r =>
            r.aggregateRank != null &&
            String(r.regionID).startsWith("Pathogenic")
        )
        .map(r => r.aggregateRank as number);

    const sharedX = rows
        .map(r => r.aggregateRank)
        .filter((r): r is number => r != null);

    const minRank = Math.min(...sharedX);
    const maxRank = Math.max(...sharedX);

    const xs = Array.from({ length: 200 }, (_, i) =>
        minRank + (i / 199) * (maxRank - minRank)
    );

    const benignDensity = cumulativeKDE(benignRanks, xs, 1.5);
    const pathogenicDensity = cumulativeKDE(pathogenicRanks, xs, 1.5);

    const DOMAIN_PAD = 0.01;

    const paddedMinRank = minRank - (maxRank - minRank) * DOMAIN_PAD;
    const paddedMaxRank = maxRank + (maxRank - minRank) * DOMAIN_PAD;


    return (
        <Box ref={chartRef}>
            <LineChart
                loading={loading}
                xAxis={[
                    {
                        data: xs,
                        min: paddedMinRank,
                        max: paddedMaxRank,
                    },
                ]}
                yAxis={[{ label: 'Density' }]}
                series={[
                    {
                        data: [],
                        label: "Input Region",
                        color: "black",
                        showMark: false
                    },
                    {
                        data: loading ? [] : pathogenicDensity,
                        label: "Positive compass variant",
                        color: "#1fa718",
                        showMark: false
                    },
                    {
                        data: loading ? [] : benignDensity,
                        label: "Negative compass variant",
                        color: "grey",
                        showMark: false
                    },
                ]}
                height={185}
                slotProps={{
                    tooltip: {
                        trigger: 'none', // Disables the tooltip on hover
                    },
                }}
            />
            <RankBand rows={rows} loading={loading} min={paddedMinRank} max={paddedMaxRank} />
        </Box>
    )
}

export default CompassChart;