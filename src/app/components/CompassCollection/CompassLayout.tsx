'use client';
import { Box, Button, FormControl, FormGroup, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { MainTableRow } from "../../types";
import { useMemo, useRef, useState } from "react";
import { Download, InfoOutlined } from "@mui/icons-material";
import { LineChart } from "@mui/x-charts";
import { downloadChart } from "../../_utility/downloads";
import RankBand from "./RankBand";

interface CompassLayoutProps {
    mainRows: MainTableRow[];
}

const CompassLayout: React.FC<CompassLayoutProps> = ({ mainRows }) => {
    const [collection, setCollection] = useState<string>("Something");
    const chartRef = useRef<HTMLDivElement>(null);

    const ranks = useMemo(
        () =>
            mainRows
                .map(r => r.aggregateRank)
                .filter((r): r is number => r != null),
        [mainRows]
    );

    const minRank = Math.min(...ranks);
    const maxRank = Math.max(...ranks);

    const generateCompassRows = (count = 100): MainTableRow[] =>
        Array.from({ length: count }, (_, i) => ({
            regionID: `test${i + 1}`,
            inputRegion: { chr: "1", start: 1, end: 1 },
            aggregateRank: Math.floor(Math.random() * 100) + 1, // 1–100, duplicates allowed
        }));

    const compassRows = generateCompassRows(100);

    const dummyX = mainRows.map(r => r.aggregateRank)

    const positiveDummy = dummyX.map(x => 10 * Math.exp(-x / 30));
    const negativeDummy = dummyX.map(x => 5 + x * 0.05);



    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Tooltip
                        title="Compass Collections are sets of functionally validated variants used as reference points. 
                    Your results are ranked against these variants to help guide analysis."
                        arrow
                        placement="top"
                    >
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                    <Typography fontWeight={600} mb={1}>
                        Compass Collection
                    </Typography>
                    <FormGroup>
                        <FormControl fullWidth>
                            <Select sx={{ height: "30px", width: "160px" }} value={collection} onChange={(event) => setCollection(event.target.value)}>
                                <MenuItem value={"Something else"}>Something else</MenuItem>
                                <MenuItem value={"Something"}>Something</MenuItem>
                            </Select>
                        </FormControl>
                    </FormGroup>
                </Stack>
                <Button
                    variant="outlined"
                    endIcon={<Download />}
                    sx={{ height: "30px" }}
                    onClick={() => downloadChart(chartRef.current, "compass_collection.png")}
                >
                    Download
                </Button>
            </Stack>
            <div ref={chartRef}>
                <LineChart
                    xAxis={[
                        {
                            data: dummyX,
                            min: minRank,
                            max: maxRank,
                        },
                    ]}
                    yAxis={[{ label: 'Density' }]}
                    series={[
                        {
                            data: positiveDummy,
                            label: "Positive compass variant",
                            color: "#1fa718",
                            showMark: false
                        },
                        {
                            data: negativeDummy,
                            label: "Negative compass variant",
                            color: "grey",
                            showMark: false
                        },
                    ]}
                    height={200}
                />
            </div>
            <RankBand mainRows={mainRows} compassRows={compassRows} />
        </Box>
    )
}

export default CompassLayout;