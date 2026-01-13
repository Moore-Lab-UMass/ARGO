import { Box, FormControl, FormGroup, MenuItem, Select, Stack, Tooltip, Typography } from "@mui/material";
import { MainTableRow } from "../types";
import { useState } from "react";
import { LineChart } from '@mui/x-charts/LineChart';
import { InfoOutlined } from "@mui/icons-material";

interface CompassLayoutProps {
    mainRows: MainTableRow[];
}

const CompassLayout: React.FC<CompassLayoutProps> = ({ mainRows }) => {
    const [collection, setCollection] = useState<string>("Something");

    return (
        <Box sx={{ p: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
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
                        <Select size="small" value={collection} onChange={(event) => setCollection(event.target.value)}>
                            <MenuItem value={"Something else"}>Something else</MenuItem>
                            <MenuItem value={"Something"}>Something</MenuItem>
                        </Select>
                    </FormControl>
                </FormGroup>
            </Stack>
            <Typography variant="body2" color="textSecondary">
                {mainRows[0]?.inputRegion.start}
            </Typography>
            <LineChart
                xAxis={[{ data: [1, 2, 3, 5, 8, 10], label: 'Rank' }]}
                yAxis={[{ label: 'Density' }]}
                series={[
                    {
                        data: [2, 5.5, 2, 8.5, 1.5, 5],
                    },
                ]}
                height={200}
            />
        </Box>
    )
}

export default CompassLayout;