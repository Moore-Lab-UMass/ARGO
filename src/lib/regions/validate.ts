import { InputRegion } from "@/types/regions";
import { chromosomeOrder } from "./parse";

/** Which required field an error is about (highlighted in the "Required fields" dialog). */
export type RegionField = "chr" | "numbers" | "ref" | "alt" | "strand";

export type ValidationError = { message: string; field?: RegionField };

const MAX_TOTAL_BASE_PAIRS = 10_000;
const VALID_ALT = /^[CGTA-]+$/;
const VALID_STRANDS = ["+", "-"];

/** "chr1 100 101 A G +" for error messages (all fields except the region ID). */
const describe = (region: InputRegion) => Object.values(region).slice(0, -1).join(" ");

/**
 * Checks uploaded regions, returning the first problem found (or null).
 * `checkReferenceAlleles` compares each ref allele to the genome and returns an error message, or "".
 */
export async function validateRegions(
    regions: InputRegion[],
    checkReferenceAlleles: (regions: InputRegion[]) => Promise<string>
): Promise<ValidationError | null> {
    const find = (bad: (r: InputRegion) => boolean) => regions.find(bad);
    let region: InputRegion | undefined;

    if ((region = find((r) => Object.values(r).some((v) => typeof v === "string" && v.includes(" "))))) {
        return { message: `Fields must be separated by tabs in region at regionID: ${region.regionID}\n(${describe(region)})` };
    }
    if ((region = find((r) => !(chromosomeOrder(r.chr) > 0)))) {
        return { field: "chr", message: `Provide a valid chromosome (1-22, X or Y) at regionID: ${region.regionID}\n(${describe(region)})` };
    }
    if ((region = find((r) => isNaN(r.start) || isNaN(r.end)))) {
        return { field: "numbers", message: `Start and End must be numbers at regionID: ${region.regionID}\n(${describe(region)})` };
    }
    if ((region = find((r) => r.end <= r.start))) {
        return {
            field: "numbers",
            message: `End position must be greater than start position at regionID: ${region.regionID}\n(${describe(region)})`,
        };
    }
    const totalBasePairs = regions.reduce((sum, r) => sum + (r.end - r.start), 0);
    if (totalBasePairs > MAX_TOTAL_BASE_PAIRS) {
        return { message: "The total base pairs in the input regions must not exceed 10,000." };
    }

    const refError = await checkReferenceAlleles(regions);
    if (refError !== "") return { field: "ref", message: refError };

    if ((region = find((r) => !VALID_ALT.test(r.alt)))) {
        return {
            field: "alt",
            message: `Alternate allele must only include these 5 characters [A, C, T, G, -] at regionID: ${region.regionID}\n(${describe(region)})`,
        };
    }
    if ((region = find((r) => !VALID_STRANDS.includes(r.strand)))) {
        return { field: "strand", message: `Strand must only but + or - at regionID: ${region.regionID}\n(${describe(region)})` };
    }
    return null;
}
