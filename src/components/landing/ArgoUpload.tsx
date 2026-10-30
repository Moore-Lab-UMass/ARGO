import { useCallback, useState } from "react";
import { useLazyQuery } from "@apollo/client/react";
import { useSubmitRegions } from "@/hooks/useSubmitRegions";
import { REF_CHECK_QUERY } from "@/lib/graphql/queries";
import { parseRegionsTsv } from "@/lib/regions/parse";
import { RegionField, validateRegions } from "@/lib/regions/validate";
import { InputRegion } from "@/types/regions";
import ExampleLinks from "./ExampleLinks";
import FormatHint from "./FormatHint";
import UploadForm from "./UploadForm";

const COLUMNS: { label: string; tooltip: string; field?: RegionField; optional?: boolean }[] = [
    { label: "chr", tooltip: "Chromosome where the variant is located, e.g. chr1", field: "chr" },
    { label: "start", tooltip: "Start position of the variant, e.g. 1000000", field: "numbers" },
    { label: "end", tooltip: "End position of the variant, e.g. 1000001", field: "numbers" },
    { label: "ref", tooltip: "Reference allele, e.g. G", field: "ref" },
    { label: "alt", tooltip: "Alternate allele. Insertion e.g. C, deletion: -", field: "alt" },
    { label: "strand", tooltip: "Strand, + or -", field: "strand" },
    { label: "regionID (optional)", tooltip: "Optional region identifier, text or a number", optional: true },
];

/** Upload in ARGO's required-fields format (chr, start, end, ref, alt, strand, optional ID). */
export default function ArgoUpload() {
    const submitRegions = useSubmitRegions();
    const [checkRefs] = useLazyQuery(REF_CHECK_QUERY);
    const [errorField, setErrorField] = useState<RegionField | null>(null);

    /** Compares each reference allele to the genome; returns an error message or "". */
    const checkReferenceAlleles = useCallback(
        async (regions: InputRegion[]) => {
            const response = await checkRefs({
                variables: {
                    inputs: regions.map((r) => ({
                        chrom: r.chr,
                        start: r.start,
                        end: r.end,
                        regionid: r.regionID as string,
                        ref: r.ref,
                        strand: r.strand,
                    })),
                },
            });
            const mismatches = response.data?.refcheckmotifranking ?? [];
            return mismatches
                .map(
                    (r) =>
                        `Reference allele does not match at regionID: ${r.regionid} (${r.chrom} ${r.start} ${r.end}), the correct reference allele would be ${r.refTrue}`
                )
                .join("\n");
        },
        [checkRefs]
    );

    const handleSubmit = async (text: string, fileName: string) => {
        const regions = parseRegionsTsv(text);
        const error = await validateRegions(regions, checkReferenceAlleles);
        if (error) {
            setErrorField(error.field ?? null);
            return error.message;
        }
        submitRegions(regions, fileName);
        return null;
    };

    return (
        <UploadForm
            onSubmit={handleSubmit}
            textSubmissionName="textSubmission"
            textPlaceholder={"Paste rows from Excel, tab separated:\nchr1\t1000000\t1000001\tG\tC\t+\tvariant1"}
            onReset={() => setErrorField(null)}
            format={
                <FormatHint
                    title="Columns, tab separated"
                    chips={COLUMNS.map(({ field, ...chip }) => ({ ...chip, error: !!field && field === errorField }))}
                />
            }
            footer={<ExampleLinks />}
        />
    );
}
