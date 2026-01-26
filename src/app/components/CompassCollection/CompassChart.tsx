import { LineChart } from "@mui/x-charts";
import { MainTableRow } from "../../types";
import RankBand from "./RankBand";
import { kde } from "./helpers";

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

    const sharedX = rows.map(r => r.aggregateRank)

    const benignDensity = kde(benignRanks, sharedX, 1.5);
    const pathogenicDensity = kde(pathogenicRanks, sharedX, 1.5);

    return (
        <div ref={chartRef}>
                <LineChart
                    loading={loading}
                    xAxis={[
                        {
                            data: sharedX,
                            min: sharedX.length > 0 ? Math.min(...sharedX) : 0,
                            max: sharedX.length > 0 ? Math.max(...sharedX) : 1,
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
                            data: benignDensity,
                            label: "Positive compass variant",
                            color: "#1fa718",
                            showMark: false
                        },
                        {
                            data: pathogenicDensity,
                            label: "Negative compass variant",
                            color: "grey",
                            showMark: false
                        },
                    ]}
                height={200}
                slotProps={{
                    tooltip: {
                        trigger: 'none', // Disables the tooltip on hover
                    },
                }}
                />
            <RankBand rows={rows} loading={loading} />
            </div>
    )
}

export default CompassChart;