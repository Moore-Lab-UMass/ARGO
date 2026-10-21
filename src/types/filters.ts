import { EncodeBiosample } from "@weng-lab/ui-components";

export type Alignment =
    | "241-mam-phyloP"
    | "447-mam-phyloP"
    | "241-mam-phastCons"
    | "43-prim-phyloP"
    | "43-prim-phastCons"
    | "243-prim-phastCons"
    | "100-vert-phyloP"
    | "100-vert-phastCons";

export type MotifCatalog = "factorbook" | "hocomoco" | "zMotif";

export type MotifQuality = { a: boolean; b: boolean; c: boolean; d: boolean };

export type DataSource = { p: boolean; s: boolean; m: boolean; g: boolean; i: boolean; b: boolean };

export type CCREClasses = {
    CA: boolean;
    "CA-CTCF": boolean;
    "CA-H3K4me3": boolean;
    "CA-TF": boolean;
    dELS: boolean;
    pELS: boolean;
    PLS: boolean;
    TF: boolean;
};

export type CCREAssays = { dnase: boolean; atac: boolean; ctcf: boolean; h3k4me3: boolean; h3k27ac: boolean };

export type Assay = keyof CCREAssays;

export type ComputationalMethod =
    | "ABC_(DNase_only)"
    | "ABC_(full)"
    | "EPIraction"
    | "GraphRegLR"
    | "rE2G_(DNase_only)"
    | "rE2G_(extended)";

export type GeneLinkingMethod =
    | "distance"
    | "eQTLs"
    | "Intact_HiC"
    | "CRISPRi_FlowFISH"
    | "CTCF_ChIAPET"
    | "RNAPII_ChIAPET"
    | ComputationalMethod;

/** A biosample used for gene linkage; `cellType` is what the linkage queries filter on. */
export type CompBiosample = EncodeBiosample & { cellType?: string };

export type SequenceFilterState = {
    useConservation: boolean;
    alignment: Alignment;
    rankBy: "min" | "max" | "avg";
    useMotifs: boolean;
    motifCatalog: MotifCatalog;
    motifQuality: MotifQuality;
    dataSource: DataSource;
    numOverlappingMotifs: boolean;
    motifScoreDelta: boolean;
    overlapsTFPeak: boolean;
    tfPeakStrength: boolean;
};

export type ElementFilterState = {
    usecCREs: boolean;
    cCREAssembly: "GRCh38" | "mm10";
    mustHaveOrtholog: boolean;
    selectedBiosample: EncodeBiosample | null;
    assays: CCREAssays;
    rankBy: "avg" | "max";
    availableAssays: CCREAssays;
    classes: CCREClasses;
};

export type GeneFilterState = {
    useGenes: boolean;
    methodOfLinkage: GeneLinkingMethod;
    mustBeProteinCoding: boolean;
    mustHaveOrtholog: boolean;
    rankExpSpecBy: "max" | "avg";
    rankGeneExpBy: "max" | "avg";
    selectedBiosample: EncodeBiosample | null;
    linkageBiosample: CompBiosample | null;
    rankLinkedBy: "most" | "least";
};

export type FilterState = {
    sequence: SequenceFilterState;
    element: ElementFilterState;
    gene: GeneFilterState;
};
