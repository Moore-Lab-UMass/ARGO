'use client';
import { Box, Fab, Tooltip, Portal } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import { useEffect, useMemo, useState } from "react";
import { CCREs, ElementFilterState, ElementTableRow, GeneFilterState, GeneTableRow, InputRegions, SequenceFilterState, SequenceTableRow } from "../../types";
import CompassLayout from "./CompassLayout";
import { useCompassRegions } from "../../hooks/useCompassRegions";
import { BED_INTERSECT_QUERY } from "../../queries";
import { useLazyQuery } from "@apollo/client";
import { client } from "../../client";
import { useCompassScores } from "../../hooks/useCompassScores";

interface CompassCollectionProps {
    inputRegions: InputRegions;
    sequenceFilterVariables: SequenceFilterState;
    elementFilterVariables: ElementFilterState;
    geneFilterVariables: GeneFilterState;
    inititalIntersect: CCREs;
    inputSequenceRows: SequenceTableRow[];
    inputElementRows: ElementTableRow[];
    inputGeneRows: GeneTableRow[];
}

const CLOSED_SIZE = 48; // default FAB size
const OPEN_WIDTH = 850;
const OPEN_HEIGHT = 350;

const CompassCollection: React.FC<CompassCollectionProps> = ({
    inputRegions,
    inititalIntersect,
    sequenceFilterVariables,
    elementFilterVariables,
    geneFilterVariables,
    inputElementRows,
    inputGeneRows,
    inputSequenceRows,
}) => {
    const [open, setOpen] = useState(false);
    const [collection, setCollection] = useState("Clinvar Test");
    const [getIntersectingCcres, { data: intersectArray, loading: loadingIntersect }] = useLazyQuery(BED_INTERSECT_QUERY)

    const { compassRegions, loading } = useCompassRegions(collection);
    const allRegions = [...inputRegions, ...compassRegions];

    useEffect(() => {
        if (!loading && compassRegions.length > 0) {
            const user_ccres = compassRegions.map(region => [
                region.chr,
                region.start.toString(),
                region.end.toString(),
            ]);
            getIntersectingCcres({
                variables: {
                    user_ccres: user_ccres,
                    assembly: "GRCh38",
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
        }
    }, [compassRegions, getIntersectingCcres, loading]);

    const intersectingCcres: CCREs = useMemo(() => {
        if (inititalIntersect && compassRegions && intersectArray && !loadingIntersect) {
            const transformedData: CCREs = intersectArray.intersection.map(ccre => {
                // Find the matching input region by chr, start, and end
                const matchingRegion = compassRegions.find(region =>
                    region.chr === ccre[6] &&
                    region.start === parseInt(ccre[7]) &&
                    region.end === parseInt(ccre[8])
                );

                return {
                    chr: ccre[0],
                    start: parseInt(ccre[1]),
                    end: parseInt(ccre[2]),
                    accession: ccre[4],
                    inputRegion: {
                        chr: ccre[6],
                        start: parseInt(ccre[7]),
                        end: parseInt(ccre[8])
                    },
                    regionID: matchingRegion ? matchingRegion.regionID : undefined // Add ID if a match is found
                };
            });

            return transformedData;
        }
    }, [inititalIntersect, compassRegions, intersectArray, loadingIntersect]);

    const {
        sequenceRows: compassSequenceRows,
        elementRows: compassElementRows,
        geneRows: compassGeneRows,
        loading: loadingScores,
    } = useCompassScores({
        regions: compassRegions,
        intersectingCcres,
        sequenceFilterVariables,
        elementFilterVariables,
        geneFilterVariables,
    });

    const combinedSequenceRows = useMemo(() => {
        if (!inputSequenceRows && !compassSequenceRows && !loadingScores) return [];

        return [
            ...(inputSequenceRows ?? []),
            ...(compassSequenceRows ?? []),
        ];
    }, [inputSequenceRows, compassSequenceRows, loadingScores]);

    const combinedElementRows = useMemo(() => {
        if (!inputElementRows && !compassElementRows && !loadingScores) return [];

        return [
            ...(inputElementRows ?? []),
            ...(compassElementRows ?? []),
        ];
    }, [inputElementRows, compassElementRows, loadingScores]);


    const combinedGeneRows = useMemo(() => {
        if (!inputGeneRows && !compassGeneRows && !loadingScores) return [];

        return [
            ...(inputGeneRows ?? []),
            ...(compassGeneRows ?? []),
        ];
    }, [inputGeneRows, compassGeneRows, loadingScores]);

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
                {open && (
                    <CompassLayout
                        regions={allRegions}
                        open={open}
                        collection={collection}
                        setCollection={setCollection}
                        sequenceRows={combinedSequenceRows}
                        elementRows={combinedElementRows}
                        geneRows={combinedGeneRows}
                        sequenceFilterVariables={sequenceFilterVariables}
                        elementFilterVariables={elementFilterVariables}
                        geneFilterVariables={geneFilterVariables}
                        loadingScores={loadingScores}
                    />
                )}
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
