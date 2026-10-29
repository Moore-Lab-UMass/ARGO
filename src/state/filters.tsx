"use client";
import { createContext, ReactNode, useContext, useMemo, useReducer } from "react";
import { ElementFilterState, FilterState, GeneFilterState, SequenceFilterState } from "@/types/filters";
import { FilterAction, filtersReducer, initialFilters } from "./filterReducer";

const FiltersStateContext = createContext<FilterState | null>(null);
const FiltersDispatchContext = createContext<React.Dispatch<FilterAction> | null>(null);

export function FiltersProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(filtersReducer, initialFilters);
    return (
        <FiltersDispatchContext.Provider value={dispatch}>
            <FiltersStateContext.Provider value={state}>{children}</FiltersStateContext.Provider>
        </FiltersDispatchContext.Provider>
    );
}

/** Current filter values. */
export function useFilters(): FilterState {
    const state = useContext(FiltersStateContext);
    if (!state) throw new Error("useFilters must be used inside <FiltersProvider>");
    return state;
}

/** Stable functions for changing filters (never change identity, so they don't trigger re-renders). */
export function useFilterActions() {
    const dispatch = useContext(FiltersDispatchContext);
    if (!dispatch) throw new Error("useFilterActions must be used inside <FiltersProvider>");
    return useMemo(
        () => ({
            dispatch,
            setSequence: <K extends keyof SequenceFilterState>(key: K, value: SequenceFilterState[K]) =>
                dispatch({ type: "set", section: "sequence", key, value } as FilterAction),
            setElement: <K extends keyof ElementFilterState>(key: K, value: ElementFilterState[K]) =>
                dispatch({ type: "set", section: "element", key, value } as FilterAction),
            setGene: <K extends keyof GeneFilterState>(key: K, value: GeneFilterState[K]) =>
                dispatch({ type: "set", section: "gene", key, value } as FilterAction),
            reset: () => dispatch({ type: "reset" }),
        }),
        [dispatch]
    );
}
