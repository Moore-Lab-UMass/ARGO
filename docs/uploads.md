# Uploads

The home page has two upload methods. Both use the shared [UploadForm](../src/components/landing/UploadForm.tsx) (drop a `.tsv` file or paste text) and end in `useSubmitRegions`, which sorts the regions, saves them, and opens the results page.

## ARGO format

Component: [ArgoUpload.tsx](../src/components/landing/ArgoUpload.tsx). Parser: `parseRegionsTsv` in [lib/regions/parse.ts](../src/lib/regions/parse.ts).

Tab-separated, one variant per line:

| Column | Example | Notes |
| --- | --- | --- |
| chr | `chr19` | `chr1`–`chr22`, `chrX`, `chrY` |
| start | `19407506` | 0-based (BED style) |
| end | `19407507` | Exclusive, so a SNV spans one base |
| ref | `T` | Must match the genome (checked by the API) |
| alt | `A` | `A`, `C`, `G`, `T` or `-` for a deletion |
| strand | `+` | `+` or `-` |
| regionID | `rs1000237` | Optional. Defaults to the 1-based line number |

Lines starting with `#`, `browser` or `track`, and empty lines, are skipped. See [public/ArgoExample.tsv](../public/ArgoExample.tsv).

### Validation

`validateRegions` in [lib/regions/validate.ts](../src/lib/regions/validate.ts) returns the **first** problem it finds, in this order:

1. Fields separated by spaces instead of tabs
2. Invalid chromosome
3. Start or end not a number
4. End ≤ start
5. Total base pairs across all regions over **10,000**
6. Reference allele doesn't match the genome (`REF_CHECK_QUERY`; lists every mismatch)
7. Alt allele has characters other than `ACGT-`
8. Strand isn't `+` or `-`

Each error can carry a `field`, which highlights that column red in the "Required fields" dialog.

## rsID list

Component: [SnpUpload.tsx](../src/components/landing/SnpUpload.tsx). One rsID per line. `SNP_QUERY` looks up coordinates and alleles. If any ID isn't found, the upload fails and names it. Strand is always `+`, and duplicate rsIDs are collapsed to one region.

The ARGO-format validation above doesn't run for rsID uploads.

## Example files

[ExampleFiles.tsx](../src/components/landing/ExampleFiles.tsx) submits the TSVs in `/public` directly, without validation. It's currently commented out on the home page.

## Passing the submission to the results page

[lib/regions/session.ts](../src/lib/regions/session.ts):

- `saveSubmission` stores the regions in `sessionStorage` as JSON, deflated with `pako` and base64url-encoded so large uploads fit within the storage quota. The file name is stored next to them.
- `loadSubmission` reads them back on the results page after mount (`sessionStorage` doesn't exist during server rendering).

Because of this, results only exist in the tab that made the upload. Opening a results URL in a new tab shows an empty page.

## Sorting

`sortRegions` orders regions by chromosome (1–22, then X, then Y) and start position before saving. Tables and ranking keep that order as the tie-breaking order.
