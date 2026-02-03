import { LineChart } from "@mui/x-charts";
import { MainTableRow } from "../../types";
import RankBand from "./RankBand";
import { buildPercentageSteps, movingAverage } from "./helpers";
import { Box } from "@mui/material";
// import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine';

interface RankBandProps {
    rows: MainTableRow[];
    loading: boolean;
    chartRef: React.RefObject<HTMLDivElement>;
}

const CompassChart: React.FC<RankBandProps> = ({ rows, loading, chartRef }) => {

    // const firstNARank = rows
    //     .filter(r =>
    //         r.aggregateRank != null && !String(r.regionID).startsWith("Input_") &&
    //         (
    //             r.sequenceRank == 0 ||
    //             r.elementRank == 0 ||
    //             r.geneRank == 0
    //         )
    //     )
    //     .map(r => r.aggregateRank as number)
    //     .sort((a, b) => a - b)[0];

    const variants = rows
        .filter(r => r.aggregateRank != null)
        .map(r => ({
            rank: r.aggregateRank as number,
            type: String(r.regionID).startsWith("Pathogenic")
                ? "pathogenic"
                : String(r.regionID).startsWith("Benign")
                ? "benign"
                : "input"
        }))
        .sort((a, b) => a.rank - b.rank);

    const sharedX = rows
        .map(r => r.aggregateRank)
        .filter((r): r is number => r != null);

    const minRank = Math.min(...sharedX);
    const maxRank = Math.max(...sharedX);

    const xs = Array.from({ length: 200 }, (_, i) => minRank + (i / 199) * (maxRank - minRank)); 
    const { pathogenicPct, benignPct } = buildPercentageSteps(variants, xs);
    
    //smooth the curves 
    const smoothPathogenic = movingAverage(pathogenicPct, 7);
    const smoothBenign = movingAverage(benignPct, 7);
    const DOMAIN_PAD = 0.01;
    const paddedMinRank = minRank;
    const paddedMaxRank = maxRank + (maxRank - minRank) * DOMAIN_PAD;

    // const xs = Array.from({ length: 200 }, (_, i) =>
    //     minRank + (i / 199) * (maxRank - minRank)
    // );

    // const pathogenicRanks = variants
    //     .filter(v => v.type === "pathogenic")
    //     .map(v => v.rank);

    // const benignRanks = variants
    //     .filter(v => v.type === "benign")
    //     .map(v => v.rank);

    // const pathogenicPDF = kdePDF(pathogenicRanks, xs, 2);
    // const benignPDF = kdePDF(benignRanks, xs, 2);

    // const DOMAIN_PAD = 0.01;

    // const paddedMinRank = minRank;
    // const paddedMaxRank = maxRank + (maxRank - minRank) * DOMAIN_PAD;

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
                        color: "white",
                        showMark: false
                    },
                    {
                        data: loading ? [] : smoothPathogenic,
                        label: "Positive compass variant",
                        color: "#1fa718",
                        showMark: false
                    },
                    {
                        data: loading ? [] : smoothBenign,
                        label: "Negative compass variant",
                        color: "grey",
                        showMark: false
                    },
                ]}
                height={185}
                slotProps={{
                    tooltip: { trigger: 'none' },
                    legend: {
                        sx: {
                            "& .MuiChartsLegend-mark": {
                                stroke: "black",
                                strokeWidth: 3,
                            },
                        },
                    },
                }}
            />
                {/* {firstNARank != null && (
                    <ChartsReferenceLine
                        x={firstNARank}
                        lineStyle={{
                            stroke: "black",
                            strokeDasharray: "4 4",
                            strokeWidth: 2,
                        }}
                    />
                )}
            </LineChart> */}
            <RankBand 
                rows={rows} 
                loading={loading} 
                min={paddedMinRank} 
                max={paddedMaxRank} 
                // firstNa={firstNARank}
            />
        </Box>
    )
}

export default CompassChart;