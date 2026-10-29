import { GeneLinkingMethod } from "./filters";
import { GenomicRegion, RegionID } from "./regions";

export type MainTableRow = {
    regionID: RegionID;
    inputRegion: GenomicRegion;
    /** Reference and alternate alleles from the submission */
    ref?: string;
    alt?: string;
    aggregateRank?: number;
    sequenceRank?: number;
    elementRank?: number;
    geneRank?: number;
};

export type Allele = { sequence: string; score?: number };

/** A motif overlapping a region, with its reference vs alternate allele scores. */
export type MotifHit = {
    referenceAllele: Allele;
    alt: Allele;
    diff: number;
    motifID: string;
};

export type SequenceTableRow = {
    regionID: RegionID;
    inputRegion: GenomicRegion;
    referenceAllele?: Allele;
    alt?: Allele;
    motifID?: string;
    conservationScore?: number;
    numOverlappingMotifs?: number;
    motifs?: MotifHit[];
    motifScoreDelta?: number;
};

export type ElementTableRow = {
    regionID: RegionID;
    inputRegion: GenomicRegion;
    chr: string;
    start: number;
    end: number;
    accession: string;
    ortholog?: string;
    class: string;
    dnase?: number;
    atac?: number;
    h3k4me3?: number;
    h3k27ac?: number;
    ctcf?: number;
};

/** A gene linked to a cCRE (shown in the linked genes modal). */
export type LinkedGene = {
    accession: string;
    name: string;
    geneid: string;
    linkedBy: GeneLinkingMethod;
};

/** The gene that drove a region's score (or "Average" when averaging). */
export type GeneScore = {
    geneName: string;
    score: number;
    linkedBy: GeneLinkingMethod;
};

export type GeneTableRow = {
    regionID: RegionID;
    inputRegion: GenomicRegion;
    geneExpression?: GeneScore;
    expressionSpecificity?: GeneScore;
    linkedGenes?: LinkedGene[];
};

/** Genes linked to one cCRE, before scoring. */
export type CcreGenes = {
    accession: string;
    genes: {
        name: string;
        geneId: string;
        expressionSpecificity?: number;
        geneExpression?: number;
        linkedBy: GeneLinkingMethod;
    }[];
};
