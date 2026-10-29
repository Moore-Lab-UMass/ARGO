import { GenomicRegion } from "@/types/regions";

/** "chr1:1,000-2,000" */
export const formatRegion = ({ chr, start, end }: GenomicRegion) => `${chr}:${start.toLocaleString()}-${end.toLocaleString()}`;

/** "Tissue - Display name", with the tissue capitalised. */
export const biosampleLabel = (b: { ontology: string; displayname: string }) =>
    `${b.ontology.charAt(0).toUpperCase()}${b.ontology.slice(1)} - ${b.displayname}`;
