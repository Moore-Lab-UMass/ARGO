/** UI colors used outside the MUI theme palette. */
export const COLORS = {
    /** Links and highlighted accordion headers */
    accent: "#030f98",
    /** Text on selected-biosample chips */
    chipText: "#2C5BA0",
    /** Filter drawer and header background */
    panel: "rgba(249, 248, 244, 1)",
    /** Sub-table toolbars */
    toolbar: "#e7eef8",
    /** Compass: positive (pathogenic) variants */
    pathogenic: "#1fa718",
    /** Compass: negative (benign) variants */
    benign: "grey",
};

export type Category = { label: string; color: string };

/** cCRE classes */
export const CCRE_CLASSES: Record<string, Category> = {
    "CA-CTCF": { label: "Chromatin Accessible with CTCF", color: "#00B0F0" },
    "CA-TF": { label: "Chromatin Accessible with TF", color: "#be28e5" },
    "CA-H3K4me3": { label: "Chromatin Accessible with H3K4me3", color: "#ffaaaa" },
    TF: { label: "TF", color: "#d876ec" },
    CA: { label: "Chromatin Accessible Only", color: "#06DA93" },
    pELS: { label: "Proximal Enhancer", color: "#FFA700" },
    dELS: { label: "Distal Enhancer", color: "#FFCD00" },
    PLS: { label: "Promoter", color: "#ff0000" },
    noclass: { label: "Unclassified", color: "#8c8c8c" },
    InActive: { label: "Inactive", color: "#e1e1e1" },
};

/** Motif data sources (letters in a HOCOMOCO motif id) */
export const MOTIF_DATA_SOURCES: Record<string, Category> = {
    P: { label: "ChIP-seq", color: "#1161eb" },
    S: { label: "HT-SELEX", color: "#c211eb" },
    M: { label: "Methyl HT-SELEX", color: "#eb1161" },
    G: { label: "Genomic HT-SELEX", color: "#8beb11" },
    I: { label: "SMiLe-seq", color: "#11ebb2" },
    B: { label: "PBM", color: "#eb8b11" },
    none: { label: "None", color: "grey" },
};

/** Motif quality grades */
export const MOTIF_QUALITIES: Record<string, Category> = {
    A: { label: "Found in both ChIP-seq and Ht-SELEX", color: "#6a43eb" },
    B: { label: "Reproducible in ChIP-seq or HT-SELEX", color: "#9b31eb" },
    C: { label: "Found in a single dataset", color: "#f58f8f" },
    D: { label: "Subtypes built from motifs exclusively inherited from HOCOMOCO-v12", color: "#ec4ce0" },
    none: { label: "None", color: "grey" },
};
