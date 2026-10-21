import { useCallback, useState } from "react";
import { Dialog, DialogContent, DialogTitle, IconButton, Table, TableBody, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useLazyQuery } from "@apollo/client/react";
import { useSubmitRegions } from "@/hooks/useSubmitRegions";
import { REF_CHECK_QUERY } from "@/lib/graphql/queries";
import { parseRegionsTsv } from "@/lib/regions/parse";
import { RegionField, validateRegions } from "@/lib/regions/validate";
import { InputRegion } from "@/types/regions";
import UploadForm from "./UploadForm";

const REQUIRED_FIELDS: { label: string; tooltip: string; field?: RegionField }[] = [
    { label: "Chromosome", tooltip: "Chromosome where the variant is located Ex: Chr1", field: "chr" },
    { label: "Start", tooltip: "Start position of the variant Ex: 1000000", field: "numbers" },
    { label: "End", tooltip: "End position of the variant Ex: 1000001", field: "numbers" },
    { label: "Reference Allele", tooltip: "Original Sequence Ex: G", field: "ref" },
    { label: "Alternate Allele", tooltip: "Mutated Sequence, Insertion Ex: C, Deletion Ex: -", field: "alt" },
    { label: "Strand", tooltip: "Strand information (+ or -)", field: "strand" },
    { label: "Region ID (optional)", tooltip: "Optional region identifier, String or Number" },
];

/** Upload in ARGO's required-fields format (chr, start, end, ref, alt, strand, optional ID). */
export default function ArgoUpload() {
    const submitRegions = useSubmitRegions();
    const [checkRefs] = useLazyQuery(REF_CHECK_QUERY);
    const [errorField, setErrorField] = useState<RegionField | null>(null);
    const [requiredOpen, setRequiredOpen] = useState(false);

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
        <>
            <UploadForm
                onSubmit={handleSubmit}
                textSubmissionName="textSubmission"
                onReset={() => setErrorField(null)}
                helpButton={
                    <Tooltip title="View required fields" arrow>
                        <IconButton color={errorField ? "error" : "default"} onClick={() => setRequiredOpen(true)}>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
                }
            />
            <Dialog open={requiredOpen} onClose={() => setRequiredOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>Required Fields</DialogTitle>
                <DialogContent>
                    <Table
                        sx={{
                            border: "1px solid",
                            borderColor: "black",
                            width: "100%",
                            "& td, & th": { padding: "8px", fontSize: "1rem", textAlign: "center", border: "1px solid", borderColor: "black" },
                        }}
                    >
                        <TableBody>
                            <TableRow>
                                {REQUIRED_FIELDS.map(({ label, tooltip, field }) => (
                                    <TableCell
                                        key={label}
                                        sx={{ backgroundColor: field && errorField === field ? "error.light" : "transparent" }}
                                    >
                                        <Tooltip title={tooltip} arrow>
                                            <span>{label}</span>
                                        </Tooltip>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableBody>
                    </Table>
                    <Typography variant="body1" fontSize="1rem" sx={{ mt: 2 }}>
                        If using the text box, separate fields with a tab. Below is an example file to help you format your
                        data correctly.
                    </Typography>
                </DialogContent>
            </Dialog>
        </>
    );
}
