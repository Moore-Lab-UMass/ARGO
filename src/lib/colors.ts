/** Site colors that change between light and dark mode (J3 design). */
export type SurfaceTokens = {
    /** Header background */
    cream: string;
    creamBorder: string;
    /** Page background */
    page: string;
    /** Cards, tables, dialogs */
    paper: string;
    /** Card borders and table row lines */
    border: string;
    /** Dashed outlines (drop zone, optional chips) */
    borderStrong: string;
    divider: string;
    /** Table header rows */
    subtle: string;
    /** Segmented control track, neutral badges */
    track: string;
    /** Selected segment on a track */
    raised: string;
    text: string;
    muted: string;
    link: string;
    /** Highlight for the selected table row */
    selectedRow: string;
    /** Filter sidebar, footer, selected-region header */
    sidebar: string;
    /** Text on selected-biosample chips */
    chipText: string;
    errorBg: string;
    /** Rank pill backgrounds and text, per category */
    sequenceBg: string;
    sequenceText: string;
    elementBg: string;
    elementText: string;
    geneBg: string;
    geneText: string;
};

export const LIGHT: SurfaceTokens = {
    cream: "#f9f8f4",
    creamBorder: "#e6e3da",
    page: "#f4f6fa",
    paper: "#ffffff",
    border: "#e3e7ee",
    borderStrong: "#cfd6e2",
    divider: "#eef1f5",
    subtle: "#fafbfc",
    track: "#eef1f6",
    raised: "#ffffff",
    text: "#1a2233",
    muted: "#5b6475",
    link: "#2443a3",
    selectedRow: "#eef3fc",
    sidebar: "#1c3374",
    chipText: "#2c5ba0",
    errorBg: "#fdecec",
    sequenceBg: "#e7effd",
    sequenceText: "#1d4fb0",
    elementBg: "#fdf0e1",
    elementText: "#8a4a05",
    geneBg: "#e1f4f1",
    geneText: "#0a6159",
};

export const DARK: SurfaceTokens = {
    cream: "#131926",
    creamBorder: "#252d3d",
    page: "#0d121c",
    paper: "#161c29",
    border: "#283146",
    borderStrong: "#3a4458",
    divider: "#212a3b",
    subtle: "#1a2130",
    track: "#242d40",
    raised: "#36415a",
    text: "#e4e8f0",
    muted: "#9aa5ba",
    link: "#8fb4ff",
    selectedRow: "#1d2a47",
    sidebar: "#16234a",
    chipText: "#a9c6ff",
    errorBg: "#3b1b20",
    sequenceBg: "#1b2d55",
    sequenceText: "#a9c6ff",
    elementBg: "#3d2a12",
    elementText: "#f5b04a",
    geneBg: "#113631",
    geneText: "#6ad8c9",
};

/** CSS variable for a surface token. The theme (theme.ts) defines both values under `palette.surface`. */
const v = (key: keyof SurfaceTokens) => `var(--mui-palette-surface-${key})`;

/** Core site colors. These are CSS variables, so they follow light/dark mode; use them in `sx` and styles, not in createTheme. */
export const BRAND = {
    /** Brand navy (same in both modes). A plain hex, so it works in createTheme and charts. */
    navy: "#1c3374",
    /** Secondary text on navy */
    onNavyMuted: "#c9d3ec",
    cream: v("cream"),
    creamBorder: v("creamBorder"),
    page: v("page"),
    paper: v("paper"),
    border: v("border"),
    borderStrong: v("borderStrong"),
    divider: v("divider"),
    subtle: v("subtle"),
    track: v("track"),
    raised: v("raised"),
    text: v("text"),
    muted: v("muted"),
    link: v("link"),
    selectedRow: v("selectedRow"),
    sidebar: v("sidebar"),
    errorBg: v("errorBg"),
};

/** UI colors used outside the MUI theme palette. */
export const COLORS = {
    /** Links */
    accent: BRAND.link,
    /** Text on selected-biosample chips */
    chipText: v("chipText"),
    /** Header background */
    panel: BRAND.cream,
    /** Compass: positive (pathogenic) variants */
    pathogenic: "#1fa718",
    /** Compass: negative (benign) variants */
    benign: "grey",
};

export type RankCategory = "sequence" | "element" | "gene";

/** Colors for each ranking category: rank pills, section markers and switches. `main` and `onNavy` are plain hex (same in both modes). */
export const CATEGORY_COLORS: Record<RankCategory, { label: string; main: string; onNavy: string; pillBg: string; pillText: string }> = {
    sequence: { label: "Sequence", main: "#2f6fe4", onNavy: "#8fb4ff", pillBg: v("sequenceBg"), pillText: v("sequenceText") },
    element: { label: "Elements", main: "#c26a0a", onNavy: "#f5b04a", pillBg: v("elementBg"), pillText: v("elementText") },
    gene: { label: "Genes", main: "#0f8a7e", onNavy: "#4fd1c0", pillBg: v("geneBg"), pillText: v("geneText") },
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
