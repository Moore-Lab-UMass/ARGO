import { EncodeBiosample } from "@weng-lab/ui-components";
import {
    CCREAssays,
    CompBiosample,
    ElementFilterState,
    FilterState,
    GeneLinkingMethod,
    MotifCatalog,
} from "@/types/filters";

const ALL_ASSAYS: CCREAssays = { dnase: true, atac: true, ctcf: true, h3k4me3: true, h3k27ac: true };

export const initialFilters: FilterState = {
    sequence: {
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: true,
        motifCatalog: "hocomoco",
        motifQuality: { a: true, b: true, c: true, d: true },
        dataSource: { p: true, s: true, m: true, g: true, i: true, b: true },
        numOverlappingMotifs: true,
        motifScoreDelta: true,
        overlapsTFPeak: false,
        tfPeakStrength: false,
    },
    element: {
        usecCREs: true,
        cCREAssembly: "GRCh38",
        mustHaveOrtholog: false,
        selectedBiosample: null,
        assays: ALL_ASSAYS,
        rankBy: "avg",
        availableAssays: ALL_ASSAYS,
        classes: { CA: true, "CA-CTCF": true, "CA-H3K4me3": true, "CA-TF": true, dELS: true, pELS: true, PLS: true, TF: true },
    },
    gene: {
        useGenes: true,
        methodOfLinkage: "distance",
        mustBeProteinCoding: false,
        mustHaveOrtholog: false,
        rankExpSpecBy: "max",
        rankGeneExpBy: "max",
        selectedBiosample: null,
        linkageBiosample: null,
        rankLinkedBy: "most",
    },
};

type Section = keyof FilterState;

type SetAction = {
    [S in Section]: {
        [K in keyof FilterState[S]]: { type: "set"; section: S; key: K; value: FilterState[S][K] };
    }[keyof FilterState[S]];
}[Section];

export type FilterAction =
    | SetAction
    | { type: "reset" }
    | { type: "setMotifCatalog"; catalog: MotifCatalog }
    | { type: "setElementAssembly"; assembly: ElementFilterState["cCREAssembly"] }
    | { type: "selectElementBiosample"; biosample: EncodeBiosample | null }
    | { type: "setLinkage"; method: GeneLinkingMethod; biosample: CompBiosample; includeInExpression: boolean }
    | { type: "clearLinkage" };

/** Assays a biosample has data for (all assays when no biosample is selected). */
const assaysFor = (biosample: EncodeBiosample | null): CCREAssays =>
    biosample
        ? {
              dnase: !!biosample.dnase_experiment_accession,
              h3k4me3: !!biosample.h3k4me3_experiment_accession,
              h3k27ac: !!biosample.h3k27ac_experiment_accession,
              ctcf: !!biosample.ctcf_experiment_accession,
              atac: !!biosample.atac_experiment_accession,
          }
        : ALL_ASSAYS;

export function filtersReducer(state: FilterState, action: FilterAction): FilterState {
    switch (action.type) {
        case "set":
            return { ...state, [action.section]: { ...state[action.section], [action.key]: action.value } };

        case "reset":
            return initialFilters;

        case "setMotifCatalog": {
            // TF peak options only apply to Factorbook motifs
            const tfPeak = action.catalog === "factorbook" ? { overlapsTFPeak: false, tfPeakStrength: false } : {};
            return { ...state, sequence: { ...state.sequence, ...tfPeak, motifCatalog: action.catalog } };
        }

        case "setElementAssembly":
            // Biosamples are assembly specific, so switching assembly clears the selection
            return {
                ...state,
                element: { ...state.element, cCREAssembly: action.assembly, selectedBiosample: null, availableAssays: ALL_ASSAYS, assays: ALL_ASSAYS },
            };

        case "selectElementBiosample": {
            // Only assays the biosample has data for can be ranked; select all of those
            const biosample = action.biosample ?? null;
            const assays = assaysFor(biosample);
            return { ...state, element: { ...state.element, selectedBiosample: biosample, availableAssays: assays, assays } };
        }

        case "setLinkage": {
            const { method, biosample, includeInExpression } = action;
            const useForExpression = includeInExpression && biosample.rna_seq_tracks.length > 0;
            return {
                ...state,
                gene: {
                    ...state.gene,
                    methodOfLinkage: method,
                    linkageBiosample: biosample,
                    ...(useForExpression ? { selectedBiosample: biosample as EncodeBiosample } : {}),
                },
            };
        }

        case "clearLinkage":
            return { ...state, gene: { ...state.gene, methodOfLinkage: "distance", linkageBiosample: null } };
    }
}
