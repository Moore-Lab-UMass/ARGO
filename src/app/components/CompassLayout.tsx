import { Box, Button, FormControl, FormGroup, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { MainTableRow } from "../types";
import { useState } from "react";
import { Download, InfoOutlined } from "@mui/icons-material";
import { LineChartPro, useChartProApiRef } from "@mui/x-charts-pro";

interface CompassLayoutProps {
    mainRows: MainTableRow[];
}

const CompassLayout: React.FC<CompassLayoutProps> = ({ mainRows }) => {
    const [collection, setCollection] = useState<string>("Something");
    const apiRef = useChartProApiRef<'line'>();

    return (
        <Box sx={{ p: 2, zIndex: (theme) => theme.zIndex.appBar + 1, }}>
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
                    onClick={() => {
                        apiRef.current?.exportAsImage();
                    }}
                >
                    Download Plot
                </Button>
            </Stack>
            <LineChartPro
                apiRef={apiRef}
                xAxis={[{ data: [1, 2, 3, 5, 8, 10], label: 'Rank' }]}
                yAxis={[{ label: 'Density' }]}
                series={[
                    {
                        data: [8, 9.5, 7, 2, 0, 0],
                        label: "Positive compass variant",
                        color: "#1fa718",
                        showMark: false
                    },
                    {
                        data: [1, 1.5, 2, 2.5, 3, 4.5],
                        label: "Negative compass variant",
                        color: "grey",
                        showMark: false
                    },
                ]}
                height={200}
            />
        </Box>
    )
}

export default CompassLayout;