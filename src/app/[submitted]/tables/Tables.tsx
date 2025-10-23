import { CCREs, ElementFilterState, ElementTableRow, GeneFilterState, GeneTableRow, InputRegions, IsolatedRows, MainTableRow, RankedRegions, SequenceFilterState, SequenceTableRow, Table } from "../../types";
import SequenceTable from "./sequence/SequenceTable"
import ElementTable from "./elements/ElementTable"
import GeneTable from "./genes/GeneTable"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RankedRegionsTable from "./main/MainTable"
import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { generateSequenceRanks } from "./sequence/sequenceHelpers"
import { generateElementRanks, handleSameInputRegion } from "./elements/elementHelpers"
import { generateGeneRanks } from "./genes/geneHelpers"
import TableToTop from "../../components/TableToTop";

export interface RankedRegionTablesContainerProps {
    sequenceFilterVariables: SequenceFilterState;
    elementFilterVariables: ElementFilterState;
    geneFilterVariables: GeneFilterState;
    inputRegions: InputRegions;
    intersectingCcres: CCREs;
    loadingIntersect: boolean;
}

const Tables: React.FC<RankedRegionTablesContainerProps> = ({
    sequenceFilterVariables,
    elementFilterVariables,
    geneFilterVariables,
    inputRegions,
    intersectingCcres,
    loadingIntersect
}) => {
    const [selected, setSelected] = useState<MainTableRow[]>([]);

    const [sequenceRows, setSequenceRows] = useState<SequenceTableRow[]>([])
    const [elementRows, setElementRows] = useState<ElementTableRow[]>([])
    const [geneRows, setGeneRows] = useState<GeneTableRow[]>([])

    const [loadingSequenceRows, setLoadingSequenceRows] = useState<boolean>(true);
    const [loadingElementRows, setLoadingElementRows] = useState<boolean>(true);
    const [loadingGeneRows, setLoadingGeneRows] = useState<boolean>(true);

    const [tableOrder, setTableOrder] = useState<Table[]>([
        "sequence",
        "elements",
        "genes",
    ]);

    //drag functionality for the tables, reorders the table order array
    const onDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const newOrder = [...tableOrder];
        const [movedTable] = newOrder.splice(result.source.index, 1); // Remove dragged item
        newOrder.splice(result.destination.index, 0, movedTable); // Insert at new position

        setTableOrder(newOrder);
    };

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
    const loadingSequenceRanks = (loadingSequenceRows) && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs);
    const loadingElementRanks = (loadingElementRows) && (elementFilterVariables.usecCREs);
    const loadingGeneRanks = (loadingGeneRows) && (geneFilterVariables.useGenes);
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

    const ToolBarIcon = (table: Table) => {
        return (
            <TableToTop table={table} setTableOrder={setTableOrder} tableOrder={tableOrder} />
        )
    }

    return (
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
                                                    ToolBarIcon={ToolBarIcon("sequence")}
                                                    inputRegions={inputRegions}
                                                    isolatedRows={isolatedRows?.sequence}
                                                    updateSequenceRows={setSequenceRows}
                                                    updateLoadingSequenceRows={setLoadingSequenceRows}
                                                />
                                            )}

                                            {table === "elements" && elementFilterVariables.usecCREs && (
                                                <ElementTable
                                                    elementFilterVariables={elementFilterVariables}
                                                    ToolBarIcon={ToolBarIcon("elements")}
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
                                                    ToolBarIcon={ToolBarIcon("genes")}
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
    )
}

export default Tables;