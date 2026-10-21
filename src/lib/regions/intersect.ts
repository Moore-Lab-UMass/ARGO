import { coordKey, indexBy } from "@/lib/ranking/rank";
import { Ccre, InputRegion } from "@/types/regions";

/**
 * Converts the BED intersect response into cCREs tagged with the input region they overlap.
 * Each intersection row is [cCRE chr, start, end, _, accession, _, input chr, input start, input end].
 */
export function toCcres(intersection: string[][], regions: InputRegion[]): Ccre[] {
    const regionByCoords = indexBy(regions, coordKey);
    return intersection.map((row) => {
        const inputRegion = { chr: row[6], start: parseInt(row[7]), end: parseInt(row[8]) };
        return {
            chr: row[0],
            start: parseInt(row[1]),
            end: parseInt(row[2]),
            accession: row[4],
            inputRegion,
            regionID: regionByCoords.get(coordKey(inputRegion))?.regionID,
        };
    });
}
