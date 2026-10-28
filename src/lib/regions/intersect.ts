import { coordKey, groupBy } from "@/lib/ranking/rank";
import { Ccre, InputRegion } from "@/types/regions";

/**
 * Converts the BED intersect response into cCREs tagged with the input region they overlap.
 * Each intersection row is [cCRE chr, start, end, _, accession, _, input chr, input start, input end].
 *
 * The response only has coordinates, and repeats a cCRE once per submitted line at those
 * coordinates. So repeated rows are dropped, and every input region at those coordinates
 * (e.g. different alternate alleles at one position) gets its own copy of the cCRE.
 */
export function toCcres(intersection: string[][], regions: InputRegion[]): Ccre[] {
    const regionsByCoords = groupBy(regions, coordKey);
    const seen = new Set<string>();
    return intersection.flatMap((row) => {
        const inputRegion = { chr: row[6], start: parseInt(row[7]), end: parseInt(row[8]) };
        const ccre = { chr: row[0], start: parseInt(row[1]), end: parseInt(row[2]), accession: row[4], inputRegion };

        const key = `${ccre.accession}@${coordKey(inputRegion)}`;
        if (seen.has(key)) return [];
        seen.add(key);

        const matching = regionsByCoords.get(coordKey(inputRegion)) ?? [];
        if (matching.length === 0) return [{ ...ccre, regionID: undefined }];
        return matching.map((region) => ({ ...ccre, regionID: region.regionID }));
    });
}
