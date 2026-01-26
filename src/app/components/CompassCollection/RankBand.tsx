import { Box, Skeleton, Stack, Typography } from "@mui/material";
import { MainTableRow } from "../../types";

interface RankBandProps {
    rows: MainTableRow[];
    loading: boolean;
}

const RankBand: React.FC<RankBandProps> = ({ rows, loading }) => {

    const width = 715;
    const bandHeight = 14;
    const tickHeight = 18;
    const offset = 83

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

                        return (
                            <rect
                                key={row.regionID}
                                x={scaleX(row.aggregateRank)}
                                y={0}
                                width={3}
                                height={tickHeight}
                                rx={1}
                                fill={category === "Pathogenic" ? "grey" : "green"}
                            />

                        );
                    })}
                </svg>
            )}
            <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography>Rank</Typography>
                <Typography sx={{ mr: 3 }}>Top k-accuracy: 71.4%</Typography>
            </Stack>
        </Box>
    );
}

export default RankBand