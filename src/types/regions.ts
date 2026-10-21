export type RegionID = number | string;

export type GenomicRegion = {
    chr: string;
    start: number;
    end: number;
};

/** One row of the user's submission (or a compass variant). */
export type InputRegion = GenomicRegion & {
    regionID: RegionID;
    ref: string;
    alt: string;
    strand: string;
};

/** A cCRE that overlaps one of the input regions. */
export type Ccre = GenomicRegion & {
    accession: string;
    inputRegion: GenomicRegion;
    regionID: RegionID;
};

/** A region's rank within one category (0 means unranked / N/A). */
export type RankedRegion = GenomicRegion & { rank: number };
