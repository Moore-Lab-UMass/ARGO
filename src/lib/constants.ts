import { Alignment, Assay, ComputationalMethod, GeneLinkingMethod } from "@/types/filters";

export const ASSAYS: Assay[] = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"];

export const COMPUTATIONAL_METHODS: ComputationalMethod[] = [
    "ABC_(DNase_only)",
    "ABC_(full)",
    "EPIraction",
    "GraphRegLR",
    "rE2G_(DNase_only)",
    "rE2G_(extended)",
];

export const isComputationalMethod = (method: GeneLinkingMethod): method is ComputationalMethod =>
    (COMPUTATIONAL_METHODS as GeneLinkingMethod[]).includes(method);

/** Options for the "Linking method" dropdown, in display order. */
export const LINKAGE_METHOD_OPTIONS: { value: GeneLinkingMethod; label: string }[] = [
    { value: "distance", label: "Distance" },
    { value: "Intact_HiC", label: "Intact Hi-C Loops" },
    { value: "CTCF_ChIAPET", label: "CTCF ChIA-PET Interactions" },
    { value: "RNAPII_ChIAPET", label: "RNAPII ChIA-PET Interactions" },
    { value: "CRISPRi_FlowFISH", label: "CRISPRi-FlowFISH" },
    { value: "eQTLs", label: "eQTLs" },
    { value: "ABC_(DNase_only)", label: "ABC (DNase Only)" },
    { value: "ABC_(full)", label: "ABC (Full)" },
    { value: "EPIraction", label: "EPIraction" },
    { value: "GraphRegLR", label: "GraphRegLR" },
    { value: "rE2G_(DNase_only)", label: "rE2G (DNase Only)" },
    { value: "rE2G_(extended)", label: "rE2G (Extended)" },
];

/**
 * Conservation tracks: bigWig file, label for the dropdown and label for the table column.
 * `hidden` tracks are still valid filter values but not offered in the dropdown.
 */
export const CONSERVATION_TRACKS: Record<Alignment, { url: string; menuLabel: string; columnLabel: string; hidden?: boolean }> = {
    "100-vert-phyloP": {
        url: "https://downloads.wenglab.org/hg38.phyloP100way.bw",
        menuLabel: "phyloP - 100 vertebrates",
        columnLabel: "100-Vertebrate(phyloP)",
    },
    "241-mam-phyloP": {
        url: "https://downloads.wenglab.org/241-mammalian-2020v2.bigWig",
        menuLabel: "phyloP - 241 mammals",
        columnLabel: "241-Mammal(phyloP)",
    },
    "447-mam-phyloP": {
        url: "https://downloads.wenglab.org/mammals_phyloP-447.bigWig",
        menuLabel: "phyloP - 447 mammals",
        columnLabel: "447-Mammal(phyloP)",
    },
    "43-prim-phyloP": {
        url: "https://downloads.wenglab.org/PhyloP-43.bw",
        menuLabel: "phyloP - 43 primates",
        columnLabel: "43-Primate(phyloP)",
    },
    "100-vert-phastCons": {
        url: "https://downloads.wenglab.org/hg38.phastCons100way.bw",
        menuLabel: "phastCons - 100 vertebrates",
        columnLabel: "100-Vertebrate(phastCons)",
    },
    "241-mam-phastCons": {
        url: "https://downloads.wenglab.org/241Mammals-PhastCons.bigWig",
        menuLabel: "phastCons - 241 mammals",
        columnLabel: "241-Mammal(phastCons)",
    },
    "43-prim-phastCons": {
        url: "https://downloads.wenglab.org/hg38_43primates_phastCons.bw",
        menuLabel: "phastCons - 43 primates",
        columnLabel: "43-Primate(phastCons)",
    },
    "243-prim-phastCons": {
        url: "https://downloads.wenglab.org/primates_PhastCons-243.bigWig",
        menuLabel: "phastCons - 243 primates",
        columnLabel: "243-Primate(phastCons)",
        hidden: true,
    },
};

/** Compass collections: reference variant sets shipped in /public. */
export const COMPASS_COLLECTIONS: Record<string, { file: string; count: number }> = {
    "Clinvar Disease Agnostic": { file: "/Test-Clinvar-Subset.vcf", count: 250 },
    "Hereditary Breast Ovarian Cancer Syndrome": { file: "/Hereditary_breast_ovarian_cancer_syndrome_cleaned.vcf", count: 43 },
    "Primary Ciliary Dyskinesia": { file: "/Primary_ciliary_dyskinesia_cleaned.vcf", count: 72 },
    "Inborn Genetic Diseases": { file: "/Inborn_genetic_diseases_cleaned.vcf", count: 39 },
    "Spastic Paraplegia": { file: "/Spastic_paraplegia_cleaned.vcf", count: 72 },
};

export const DEFAULT_COMPASS_COLLECTION = "Clinvar Disease Agnostic";

/** Example upload files in /public, offered on the home page. */
export const EXAMPLES = [
    { name: "Example 1", file: "/ArgoExample.tsv" },
    { name: "Example 2", file: "/ArgoExample2.tsv" },
    { name: "Example 3", file: "/ArgoExample3.tsv" },
];

export const SCREEN_URL = "https://screen.wenglab.org";
export const HOCOMOCO_MOTIF_URL = "https://hocomoco14.autosome.org/motif";
