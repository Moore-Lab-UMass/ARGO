import { Box, Stack, Typography } from "@mui/material";
import { MainTableRow } from "../../types";

interface RankBandProps {
    mainRows: MainTableRow[];
    compassRows: MainTableRow[];
}

const RankBand: React.FC<RankBandProps> = ({ mainRows, compassRows }) => {

    const width = 715;
    const bandHeight = 14;
    const tickHeight = 18;
    const offset = 83

    const ranks = compassRows
        .map(r => r.aggregateRank)
        .filter((r): r is number => r != null);

    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);

    const scaleX = (rank: number) =>
       ((rank - minRank) / (maxRank - minRank)) * width;

    return (
        <Box width="100%" pl={`${offset}px`} pr={"15px"}>
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
                {compassRows.map(row => {
                    if (row.aggregateRank == null) return null;

                    return (
                        <rect
                            key={row.regionID}
                            x={scaleX(row.aggregateRank)}
                            y={0}
                            width={3}
                            height={tickHeight}
                            rx={1}
                            fill={row.aggregateRank > 67 ? "grey" : "green"}
                        />
                        
                    );
                })}
            </svg>
            <Stack direction={"row"} justifyContent={"space-between"}>
                <Typography>Rank</Typography>
                <Typography sx={{mr: 3}}>Top k-accuracy: 71.4%</Typography>
            </Stack>
        </Box>
    );
}

export default RankBand