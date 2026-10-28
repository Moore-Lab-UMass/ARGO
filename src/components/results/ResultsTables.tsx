"use client";
import { useMemo, useState } from "react";
import { Box, Divider } from "@mui/material";
import { DragDropContext, Draggable, Droppable, DropResult } from "@hello-pangea/dnd";
import CompassCollection from "@/components/compass/CompassCollection";
import { useCategoryRows } from "@/hooks/useCategoryRows";
import { rankRegions } from "@/lib/ranking/pipeline";
import { useFilters } from "@/state/filters";
import { InputRegion, RegionID } from "@/types/regions";
import ElementTable from "./ElementTable";
import GeneTable from "./GeneTable";
import MainTable from "./MainTable";
import SequenceTable from "./SequenceTable";
import TableToTop from "./TableToTop";

type DetailTable = "sequence" | "element" | "gene";

/** Keeps only rows for the selected regions (or undefined when nothing is selected). */
function isolate<T extends { regionID: RegionID }>(rows: T[], selected: Set<RegionID>): T[] | undefined {
    return selected.size > 0 ? rows.filter((row) => selected.has(row.regionID)) : undefined;
}

/**
 * The ranked regions table followed by the sequence, element and gene detail tables
 * (which can be dragged to reorder). All data for the page is fetched here, once.
 */
export default function ResultsTables({ regions }: { regions: InputRegion[] }) {
    const filters = useFilters();
    const { rows, loading, errors } = useCategoryRows(regions, filters);
    const { mainRows } = useMemo(() => rankRegions(regions, rows, filters), [regions, rows, filters]);

    const [selected, setSelected] = useState<Set<RegionID>>(new Set());
    const [order, setOrder] = useState<DetailTable[]>(["sequence", "element", "gene"]);

    const onDragEnd = ({ source, destination }: DropResult) => {
        if (!destination) return;
        setOrder((prev) => {
            const next = [...prev];
            const [moved] = next.splice(source.index, 1);
            next.splice(destination.index, 0, moved);
            return next;
        });
    };

    // Memoized so the detail tables only get new props when their data or order changes
    const isolated = useMemo(
        () => ({
            sequence: isolate(rows.sequence, selected),
            element: isolate(rows.element, selected),
            gene: isolate(rows.gene, selected),
        }),
        [rows, selected]
    );
    const toolbars = useMemo(() => {
        const moveToTop = (table: DetailTable) => setOrder((prev) => [table, ...prev.filter((t) => t !== table)]);
        const button = (table: DetailTable) => <TableToTop isTop={order[0] === table} onClick={() => moveToTop(table)} />;
        return { sequence: button("sequence"), element: button("element"), gene: button("gene") };
    }, [order]);

    const enabled: Record<DetailTable, boolean> = {
        sequence: filters.sequence.useConservation || filters.sequence.useMotifs,
        element: filters.element.usecCREs,
        gene: filters.gene.useGenes,
    };

    const renderTable = (table: DetailTable) => {
        if (!enabled[table]) return null;
        switch (table) {
            case "sequence":
                return (
                    <SequenceTable
                        rows={rows.sequence}
                        isolatedRows={isolated.sequence}
                        loading={loading.sequence}
                        error={!!errors.sequence}
                        toolbarExtra={toolbars.sequence}
                    />
                );
            case "element":
                return (
                    <ElementTable
                        rows={rows.element}
                        isolatedRows={isolated.element}
                        loading={loading.element}
                        error={!!errors.element}
                        toolbarExtra={toolbars.element}
                    />
                );
            case "gene":
                return (
                    <GeneTable
                        rows={rows.gene}
                        isolatedRows={isolated.gene}
                        loading={loading.gene}
                        error={!!errors.gene}
                        toolbarExtra={toolbars.gene}
                    />
                );
        }
    };

    return (
        <>
            <MainTable rows={mainRows} loading={loading.any} selected={selected} onSelectedChange={setSelected} />
            <Divider sx={{ mt: "20px", borderBottomWidth: 2 }} variant="fullWidth" />
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tables">
                    {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                            {order.map((table, index) => (
                                <Draggable key={table} draggableId={table} index={index}>
                                    {(provided) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{ cursor: "grab", mt: "20px" }}
                                        >
                                            {renderTable(table)}
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </Box>
                    )}
                </Droppable>
            </DragDropContext>
            <CompassCollection pageRegions={regions} pageRows={rows} loadingPage={loading.any} />
        </>
    );
}
