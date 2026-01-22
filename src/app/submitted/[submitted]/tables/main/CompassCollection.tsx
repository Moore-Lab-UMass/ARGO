'use client';
import { Box, Fab, Tooltip, Portal } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import { useState } from "react";
import { MainTableRow } from "../../../../types";
import CompassLayout from "../../../../components/CompassCollection/CompassLayout";

interface CompassCollectionProps {
    mainRows: MainTableRow[];
}

const CLOSED_SIZE = 48; // default FAB size
const OPEN_WIDTH = 850;
const OPEN_HEIGHT = 350;

const CompassCollection: React.FC<CompassCollectionProps> = ({ mainRows }) => {
    const [open, setOpen] = useState(false);

    return (
        <Portal>
            <Box
                sx={{
                    position: "fixed",
                    bottom: 16,
                    right: 16,
                    zIndex: (theme) => theme.zIndex.appBar + 1,
                    width: open ? OPEN_WIDTH : CLOSED_SIZE,
                    height: open ? OPEN_HEIGHT : CLOSED_SIZE,
                    transition: "width 250ms ease, height 250ms ease, border-radius 250ms ease",
                    borderRadius: open ? 3 : "50%",
                    borderBottomRightRadius: 25,
                    overflow: "visible",
                    boxShadow: 6,
                    bgcolor: "background.paper",
                }}
            >
                {/* {open && ( */}
                    <CompassLayout mainRows={mainRows} open={open} />
                {/* )} */}
                <Tooltip title="Compass Collection" arrow>
                    <Fab
                        size="medium"
                        color="primary"
                        onClick={() => setOpen((prev) => !prev)}
                        sx={{
                            position: "absolute",
                            bottom: 0,
                            right: 0,
                            boxShadow: "none",
                            "& svg": {
                                transition: "transform 250ms ease",
                                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            },
                            "&:hover": {
                                backgroundColor: "primary.main",
                            },
                        }}
                    >
                        <ExploreIcon />
                    </Fab>
                </Tooltip>
            </Box>
        </Portal>
    );
};

export default CompassCollection;
