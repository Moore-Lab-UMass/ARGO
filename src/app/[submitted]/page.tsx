"use client"
import React, { useEffect, useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, Button } from "@mui/material"
import { useLazyQuery } from "@apollo/client"
import { client } from "../client"
import { RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, CCREs, InputRegions, IsolatedRows, GeneTableRow, ElementTableRow, SequenceTableRow } from "../types"
import Filters, { initialElementFilterState, initialGeneFilterState, initialSequenceFilterState } from "./filters"
import { generateSequenceRanks } from "./sequence/sequenceHelpers"
import { generateElementRanks, handleSameInputRegion } from "./elements/elementHelpers"
import SequenceTable from "./sequence/sequenceTable"
import ElementTable from "./elements/elementTable"
import GeneTable from "./genes/geneTable"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { generateGeneRanks } from "./genes/geneHelpers"
import { BED_INTERSECT_QUERY } from "../queries"
import { decodeRegions } from "../_utility/coding"
import Link from "next/link"
import RankedRegionsTable from "./main/mainTable"
import SubTableTitle from "../components/SubTableTitle"

export default function Argo() {
    const [fileName, setFileName] = useState<string | null>(null);
    const [regions, setRegions] = useState<InputRegions>([]);
    const [inputRegions, setInputRegions] = useState<InputRegions>([]);
    const [selected, setSelected] = useState<MainTableRow[]>([]);
    const [getIntersectingCcres, { data: intersectArray, loading: loadingIntersect }] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [tableOrder, setTableOrder] = useState<("sequence" | "elements" | "genes")[]>([
        "sequence",
        "elements",
        "genes",
    ]);

    const [sequenceRows, setSequenceRows] = useState<SequenceTableRow[]>([])
    const [elementRows, setElementRows] = useState<ElementTableRow[]>([])
    const [geneRows, setGeneRows] = useState<GeneTableRow[]>([])

    const [loadingSequenceRows, setLoadingSequenceRows] = useState<boolean>(true);
    const [loadingElementRows, setLoadingElementRows] = useState<boolean>(true);
    const [loadingGeneRows, setLoadingGeneRows] = useState<boolean>(true);

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>(initialSequenceFilterState);
    const [elementFilterVariables, setElementFilterVariables] = useState<ElementFilterState>(initialElementFilterState);
    const [geneFilterVariables, setGeneFilterVariables] = useState<GeneFilterState>(initialGeneFilterState);

    //Run on first page load to decode the submitted regions and file name
    useEffect(() => {
        const encodedRegions = sessionStorage.getItem("encodedRegions")
        const file = sessionStorage.getItem("fileName")
        if (encodedRegions) {
            try {
                const decoded = decodeRegions(encodedRegions);
                setRegions(decoded);
                setFileName(file)
            } catch (err) {
                console.error("Failed to get regions:", err);
            }
        }
    }, []);

    //Query the intersecting ccres based on the user inputed regions
    useEffect(() => {
        if (regions && regions.length > 0) {
            setInputRegions(regions);
            const user_ccres = regions.map(region => [
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
        } else {
            setInputRegions([]);
        }
    }, [regions, getIntersectingCcres]);

    //update specific variable in sequence filters
    const updateSequenceFilter = (key: keyof SequenceFilterState, value: unknown) => {
        setSequenceFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in element filters
    const updateElementFilter = (key: keyof ElementFilterState, value: unknown) => {
        setElementFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in gene filters
    const updateGeneFilter = (key: keyof GeneFilterState, value: unknown) => {
        setGeneFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //drag functionality for the tables, reorders the table order array
    const onDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const newOrder = [...tableOrder];
        const [movedTable] = newOrder.splice(result.source.index, 1); // Remove dragged item
        newOrder.splice(result.destination.index, 0, movedTable); // Insert at new position

        setTableOrder(newOrder);
    };

    //all ccres intersecting the user inputted regions
    const intersectingCcres: CCREs = useMemo(() => {
        if (intersectArray) {
            const transformedData: CCREs = intersectArray.intersection.map(ccre => {
                // Find the matching input region by chr, start, and end
                const matchingRegion = inputRegions.find(region =>
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
    }, [inputRegions, intersectArray]);

    //sequence ranks for main table
    const sequenceRanks: RankedRegions = useMemo(() => {
        if (sequenceRows === null || (!sequenceFilterVariables.useConservation && !sequenceFilterVariables.useMotifs)) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (sequenceRows.length === 0) {
            return [];
        }

        const rankedRegions = generateSequenceRanks(sequenceRows)

        return rankedRegions;
    }, [inputRegions, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs, sequenceRows]);

    // element ranks for main table
    const elementRanks = useMemo<RankedRegions>(() => {
        if (elementRows === null || !elementFilterVariables.usecCREs) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (elementRows.length === 0) {
            return [];
        }

        //find ccres with same input region and combine them based on users rank by selected
        const processedRows = handleSameInputRegion(elementFilterVariables.rankBy, elementRows)
        const rankedRegions = generateElementRanks(processedRows, elementFilterVariables.classes, elementFilterVariables.assays)

        return rankedRegions;

    }, [elementFilterVariables.assays, elementFilterVariables.classes, elementFilterVariables.rankBy, elementFilterVariables.usecCREs, elementRows, inputRegions]);

    //gene ranks for main table
    const geneRanks = useMemo<RankedRegions>(() => {
        if (geneRows === null || !geneFilterVariables.useGenes) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0,
            }));
        } else if (geneRows.length === 0) {
            return [];
        }

        const rankedRegions = generateGeneRanks(geneRows, geneFilterVariables.rankLinkedBy)

        return rankedRegions

    }, [geneFilterVariables.rankLinkedBy, geneFilterVariables.useGenes, geneRows, inputRegions]);

    // All loading states for main table columns
    const loadingSequenceRanks = (sequenceRanks.length === 0 || loadingSequenceRows) && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs);
    const loadingElementRanks = (elementRanks.length === 0 || loadingElementRows) && (elementFilterVariables.usecCREs);
    const loadingGeneRanks = (geneRanks.length === 0 || loadingGeneRows) && (geneFilterVariables.useGenes);
    const loadingMainRows = loadingSequenceRanks || loadingElementRanks || loadingGeneRanks;



    //find all the region id's of the isolated row and pass them to the other tables
    const isolatedRows: IsolatedRows | null = useMemo(() => {
        if (selected.length === 0) return null;

        const sequenceIsolates =
            sequenceRows?.filter(seqRow =>
                selected.some(sel => sel.regionID === seqRow.regionID)
            ) ?? [];

        const elementIsolates =
            elementRows?.filter(elRow =>
                selected.some(sel => sel.regionID === elRow.regionID)
            ) ?? [];

        const geneIsolates =
            geneRows?.filter(gRow =>
                selected.some(sel => sel.regionID === gRow.regionID)
            ) ?? [];

        return {
            main: selected,
            sequence: sequenceIsolates,
            element: elementIsolates,
            gene: geneIsolates,
        };
    }, [selected, sequenceRows, elementRows, geneRows]);

    return (
        <Box display="flex">
            <Filters
                sequenceFilterVariables={sequenceFilterVariables}
                elementFilterVariables={elementFilterVariables}
                geneFilterVariables={geneFilterVariables}
                updateSequenceFilter={updateSequenceFilter}
                updateElementFilter={updateElementFilter}
                updateGeneFilter={updateGeneFilter}
                drawerOpen={drawerOpen}
                toggleDrawer={toggleDrawer}
            />
            <Box
                ml={drawerOpen ? { xs: '300px', sm: '300px', md: '300px', lg: '25vw' } : 0}
                padding={3}
                flexGrow={1}
                height={"100%"}
                zIndex={1}
            >
                <Stack direction={"row"} justifyContent={"space-between"} alignItems="center">
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ backgroundColor: theme => theme.palette.secondary.main, padding: 1 }} borderRadius={1}>
                        <Typography mb={1} variant="h6">
                            Uploaded:
                        </Typography>
                        <Typography>
                            {fileName}
                        </Typography>
                    </Stack>
                    <Button variant="outlined" LinkComponent={Link} href="/" sx={{ height: "48px" }}>
                        New Submission
                    </Button>
                </Stack>
                {inputRegions.length > 0 && (
                    <>
                        <RankedRegionsTable
                            inputRegions={inputRegions}
                            sequenceRanks={sequenceRanks}
                            elementRanks={elementRanks}
                            geneRanks={geneRanks}
                            loading={loadingMainRows}
                            selected={selected}
                            setSelected={setSelected}
                            useCcres={elementFilterVariables.usecCREs}
                            useConservation={sequenceFilterVariables.useConservation}
                            useGenes={geneFilterVariables.useGenes}
                            useMotifs={sequenceFilterVariables.useMotifs}
                        />

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="tables">
                                {(provided) => (
                                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                                        {tableOrder.map((table, index) => (
                                            <Draggable key={table} draggableId={table} index={index}>
                                                {(provided) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        sx={{
                                                            cursor: 'grab',
                                                            mt: '20px',
                                                        }}
                                                    >
                                                        {table === "sequence" && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) && (
                                                            <SequenceTable
                                                                sequenceFilterVariables={sequenceFilterVariables}
                                                                label={<SubTableTitle title="Sequence Details" table="sequence" setTableOrder={setTableOrder} />}
                                                                inputRegions={inputRegions}
                                                                isolatedRows={isolatedRows?.sequence}
                                                                updateSequenceRows={setSequenceRows}
                                                                updateLoadingSequenceRows={setLoadingSequenceRows}
                                                            />
                                                        )}

                                                        {table === "elements" && elementFilterVariables.usecCREs && (
                                                            <ElementTable
                                                                elementFilterVariables={elementFilterVariables}
                                                                label={<SubTableTitle title="Element Details (Overlapping cCREs)" table="elements" setTableOrder={setTableOrder} />}
                                                                intersectingCcres={intersectingCcres}
                                                                loadingIntersect={loadingIntersect}
                                                                isolatedRows={isolatedRows?.element}
                                                                updateElementRows={setElementRows}
                                                                updateLoadingElementRows={setLoadingElementRows}
                                                            />
                                                        )}

                                                        {table === "genes" && geneFilterVariables.useGenes && (
                                                            <GeneTable
                                                                geneFilterVariables={geneFilterVariables}
                                                                label={<SubTableTitle title="Gene Details" table="genes" setTableOrder={setTableOrder} />}
                                                                intersectingCcres={intersectingCcres}
                                                                loadingIntersect={loadingIntersect}
                                                                isolatedRows={isolatedRows?.gene}
                                                                updateGeneRows={setGeneRows}
                                                                updateLoadingGeneRows={setLoadingGeneRows}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
                )}
            </Box>
        </Box>
    )
}