"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Box, Fab, Portal, Skeleton, Tooltip } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import { DEFAULT_COMPASS_COLLECTION } from "@/lib/constants";
import type { CompassPanelProps } from "./CompassPanel";

// The panel (charts, image export) is only downloaded and run once Compass is opened
const CompassPanel = dynamic(() => import("./CompassPanel"), {
    ssr: false,
    loading: () => <Skeleton variant="rounded" height="100%" />,
});

const CLOSED_SIZE = 48; // default FAB size
const OPEN_WIDTH = 850;
const OPEN_HEIGHT = 350;

type CompassCollectionProps = Omit<CompassPanelProps, "collection" | "onCollectionChange">;

/** Floating button that opens the Compass Collection panel. */
export default function CompassCollection(props: CompassCollectionProps) {
    const [open, setOpen] = useState(false);
    const [collection, setCollection] = useState(DEFAULT_COMPASS_COLLECTION);

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
                {open && <CompassPanel {...props} collection={collection} onCollectionChange={setCollection} />}
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
                            "& svg": { transition: "transform 250ms ease", transform: open ? "rotate(180deg)" : "rotate(0deg)" },
                            "&:hover": { backgroundColor: "primary.main" },
                        }}
                    >
                        <ExploreIcon />
                    </Fab>
                </Tooltip>
            </Box>
        </Portal>
    );
}
