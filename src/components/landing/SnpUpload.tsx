import { IconButton, Tooltip } from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useLazyQuery } from "@apollo/client/react";
import { useSubmitRegions } from "@/hooks/useSubmitRegions";
import { SNP_QUERY } from "@/lib/graphql/queries";
import { dataLines } from "@/lib/regions/parse";
import { InputRegion } from "@/types/regions";
import UploadForm from "./UploadForm";

/** Upload a list of rsIDs (one per line); coordinates and alleles are looked up automatically. */
export default function SnpUpload() {
    const submitRegions = useSubmitRegions();
    const [getSnps] = useLazyQuery(SNP_QUERY);

    const handleSubmit = async (text: string, fileName: string) => {
        const ids = dataLines(text).map((line) => line.trim());
        const response = await getSnps({ variables: { snp: ids } });
        const snps = response?.data?.getSNPAllele ?? [];

        const found = new Set(snps.map((s) => s.snp));
        const missing = ids.find((id) => !found.has(id));
        if (missing) return `${missing} is not a valid snp id`;

        const regions: InputRegion[] = snps.map((snp) => ({
            chr: snp.chrom,
            start: snp.start,
            end: snp.start === snp.stop ? snp.start + 1 : snp.stop,
            ref: snp.refallele,
            alt: snp.altallele,
            strand: "+",
            regionID: snp.snp,
        }));
        // An rsID can come back more than once; keep one region per ID
        const unique = Array.from(new Map(regions.map((r) => [r.regionID, r])).values());

        submitRegions(unique, fileName);
        return null;
    };

    return (
        <UploadForm
            onSubmit={handleSubmit}
            textSubmissionName="TextSubmission"
            helpButton={
                <Tooltip
                    title="Upload or type in RSID's and ARGO will autofill the required fields to be ready to rank! Please seperate ID's with a new line."
                    arrow
                >
                    <IconButton>
                        <HelpOutlineIcon />
                    </IconButton>
                </Tooltip>
            }
        />
    );
}
