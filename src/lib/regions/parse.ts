import { InputRegion } from "@/types/regions";

const isDataLine = (line: string) =>
    !(line.startsWith("#") || line.startsWith("browser") || line.startsWith("track") || line.length === 0);

/** Non-empty, non-comment lines of a TSV/BED-like text. */
export const dataLines = (text: string): string[] => text.split("\n").filter(isDataLine);

/**
 * Parses ARGO's required-fields format (tab separated):
 * chr, start, end, ref, alt, strand, optional regionID (defaults to the 1-based line number).
 */
export function parseRegionsTsv(text: string): InputRegion[] {
    return dataLines(text).map((line, index) => {
        const item = line.split("\t");
        return {
            chr: item[0],
            start: Number(item[1]),
            end: Number(item[2]),
            ref: item[3],
            alt: item[4],
            strand: item[5],
            regionID: item.length === 7 ? item[6].replace("\r", "") : index + 1,
        };
    });
}

/** Numeric part of a chromosome name ("chr12" → 12). */
const chrNumber = (chr: string) => Number(chr.replace("chr", ""));

/** Sorts regions by chromosome number, then start position (in place, also returned). */
export function sortRegions<T extends InputRegion>(regions: T[]): T[] {
    return regions.sort((a, b) => {
        const chrA = chrNumber(a.chr);
        const chrB = chrNumber(b.chr);
        if (chrA !== chrB) return chrA - chrB;
        return a.start - b.start;
    });
}

/**
 * Parses a compass collection VCF (CHROM, POS, REF, ALT, ID, CLNSIG_category).
 * Region IDs are `<category>_<id>`, e.g. `Pathogenic_12345`.
 */
export function parseCompassVcf(text: string): InputRegion[] {
    const regions: InputRegion[] = [];
    for (const line of text.split("\n")) {
        if (!line || line.startsWith("#")) continue;
        const [chrom, pos, ref, alt, id, category] = line.split("\t");
        const start = Number(pos) - 1;
        // Substitutions and deletions span the reference allele; insertions span one base.
        const end = ref.length >= alt.length ? start + ref.length : start + 1;
        regions.push({ chr: chrom, start, end, regionID: `${category}_${id}`, ref, alt, strand: "+" });
    }
    return regions;
}

/** Compass variant category from its region ID. */
export function compassCategory(regionID: string | number): "pathogenic" | "benign" | "input" {
    const id = String(regionID);
    if (id.startsWith("Pathogenic")) return "pathogenic";
    if (id.startsWith("Benign")) return "benign";
    return "input";
}
