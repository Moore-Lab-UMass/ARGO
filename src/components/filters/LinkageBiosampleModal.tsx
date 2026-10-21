import { useMemo, useState } from "react";
import { Button, Checkbox, Dialog, DialogContent, FormControlLabel, FormGroup, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { CancelRounded } from "@mui/icons-material";
import { useQuery } from "@apollo/client/react";
import { gridRowNodeSelector, GridRowParams, useGridApiRef } from "@mui/x-data-grid-premium";
import { BiosampleTable, displayNameCol, ontologyCol, useEncodeBiosampleData } from "@weng-lab/ui-components";
import { COMPUTATIONAL_CELL_TYPES_QUERY, LINKED_GENES_CELL_TYPES_QUERY } from "@/lib/graphql/queries";
import { isComputationalMethod } from "@/lib/constants";
import { CompBiosample, GeneLinkingMethod } from "@/types/filters";
import TissueList from "./TissueList";

/** A biosample entry with only names filled in (for cell types / tissues outside the ENCODE registry). */
const placeholderBiosample = (fields: Pick<CompBiosample, "name" | "ontology" | "displayname"> & { cellType?: string }): CompBiosample => ({
    assembly: "GRCh38",
    lifeStage: "other",
    sampleType: "other",
    dnase_experiment_accession: null,
    h3k4me3_experiment_accession: null,
    h3k27ac_experiment_accession: null,
    ctcf_experiment_accession: null,
    atac_experiment_accession: null,
    dnase_file_accession: null,
    h3k4me3_file_accession: null,
    h3k27ac_file_accession: null,
    ctcf_file_accession: null,
    atac_file_accession: null,
    rna_seq_tracks: [], // samples outside the registry have no RNA-seq data
    ...fields,
});

/** Cell types that have links for this method (experimental or computational). */
function useLinkageCellTypes(method: GeneLinkingMethod): CompBiosample[] {
    const isComputational = isComputationalMethod(method);
    const { data: cellTypes } = useQuery(LINKED_GENES_CELL_TYPES_QUERY, {
        variables: { assay: method.replace("_", "-") },
        skip: method === "distance" || method === "eQTLs" || isComputational,
    });
    const { data: compuCellTypes } = useQuery(COMPUTATIONAL_CELL_TYPES_QUERY, {
        variables: { method: [method] },
        skip: !isComputational,
    });

    return useMemo(() => {
        const biosamples = new Map<string, CompBiosample>();
        cellTypes?.getLinkedGenesCelltypesByAssay.forEach((item) => {
            biosamples.set(
                item.biosample_value,
                placeholderBiosample({ name: item.biosample_value, ontology: item.tissue, displayname: item.displayname, cellType: item.celltype })
            );
        });
        compuCellTypes?.getCompuLinkedGenesCelltypes.forEach((item) => {
            if (!biosamples.has(item.biosample_value)) {
                biosamples.set(
                    item.biosample_value,
                    placeholderBiosample({
                        name: item.biosample_mapping ?? item.biosample_value,
                        ontology: item.tissue,
                        displayname: item.biosample_value,
                        cellType: item.biosample_value,
                    })
                );
            }
        });
        return Array.from(biosamples.values());
    }, [cellTypes, compuCellTypes]);
}

type LinkageBiosampleModalProps = {
    open: boolean;
    method: GeneLinkingMethod;
    onClose: () => void;
    onSubmit: (biosample: CompBiosample, includeInExpression: boolean) => void;
};

/** Picks the biosample (or tissue, for eQTLs) whose gene links should be used. */
export function LinkageBiosampleModal({ open, method, onClose, onSubmit }: LinkageBiosampleModalProps) {
    const [include, setInclude] = useState(false);
    const [selected, setSelected] = useState<CompBiosample | null>(null);
    const extraRows = useLinkageCellTypes(method);

    const { data: encodeSamples, loading: encodeLoading, error: encodeError } = useEncodeBiosampleData({
        assembly: "GRCh38",
        skip: method === "eQTLs",
    });

    // ENCODE samples with RNA-seq that have links for this method, plus linked cell types not in ENCODE
    const rows: CompBiosample[] = useMemo(() => {
        if (encodeLoading || encodeError || !encodeSamples) return [];
        const encodeWithRnaSeq = encodeSamples.filter((b) => b.rna_seq_tracks.length > 0);
        const byOntology = (a: CompBiosample, b: CompBiosample) => a.ontology.localeCompare(b.ontology);
        if (extraRows.length === 0) return [...encodeWithRnaSeq].sort(byOntology);

        const extraByName = new Map(extraRows.map((e) => [e.name, e]));
        const encodeNames = new Set(encodeWithRnaSeq.map((b) => b.name));
        const matchingEncode = encodeWithRnaSeq
            .filter((b) => extraByName.has(b.name))
            .map((b) => ({ ...b, cellType: extraByName.get(b.name)?.cellType }));
        const notInEncode = extraRows.filter((e) => !encodeNames.has(e.name));
        return [...matchingEncode, ...notInEncode].sort(byOntology);
    }, [encodeError, encodeLoading, encodeSamples, extraRows]);

    const handleSubmit = () => {
        onSubmit(selected, include);
        setSelected(null);
        setInclude(false);
    };

    const apiRef = useGridApiRef();
    const isLeaf = (id: GridRowParams["id"]) => gridRowNodeSelector(apiRef, id)?.type !== "group";
    const hasRnaSeq = !!selected && selected.rna_seq_tracks.length > 0;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent>
                <Typography variant="h6" gutterBottom>
                    Linkage Method: {method}
                </Typography>
                {selected && (
                    <Stack
                        minWidth="350px"
                        direction="row"
                        alignItems="center"
                        borderRadius={1}
                        justifyContent="space-between"
                        sx={{ backgroundColor: (theme) => theme.palette.secondary.main }}
                        width="fit-content"
                        paddingX={1}
                    >
                        <Typography>
                            <b>Selected: </b>
                            {selected.displayname}
                        </Typography>
                        <IconButton onClick={() => setSelected(null)}>
                            <CancelRounded />
                        </IconButton>
                    </Stack>
                )}
                {method !== "eQTLs" ? (
                    <BiosampleTable
                        apiRef={apiRef}
                        rows={rows}
                        columns={[displayNameCol, ontologyCol]}
                        loading={encodeLoading}
                        error={encodeError}
                        label="Select a Biosample"
                        assembly="GRCh38"
                        disableMultipleRowSelection
                        isRowSelectable={(params) => isLeaf(params.id)}
                        disableRowSelectionOnClick={false}
                        onSelectionChange={(samples: CompBiosample[]) => setSelected(samples[0])}
                        rowSelectionModel={{ type: "include", ids: new Set(selected ? [selected.name] : []) }}
                        divHeight={{ height: 650 }}
                        getRowClassName={(params) => (isLeaf(params.id) ? "is-leaf-row" : "")}
                        sx={{ "& .is-leaf-row:hover": { cursor: "pointer" } }}
                        disableRowGrouping={false}
                        initialState={{
                            rowGrouping: { model: ["ontology"] },
                            columns: {
                                // displayname is hidden because it is the grouping column's leaf field
                                columnVisibilityModel: { ontology: true, assays: false, displayname: false },
                            },
                        }}
                    />
                ) : (
                    <TissueList
                        onSelect={(tissue) => setSelected(placeholderBiosample({ name: tissue, ontology: tissue, displayname: tissue }))}
                        selected={selected}
                    />
                )}
                <Stack width="100%" direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <FormGroup>
                        <Tooltip
                            title={
                                hasRnaSeq ? "" : "Selected Biosample does not have RNASeq Data and can not be used in Gene Expression Calculation"
                            }
                        >
                            <span>
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Include in Gene Expression Calculation"
                                    onChange={() => setInclude(!include)}
                                    checked={hasRnaSeq ? include : false}
                                    disabled={!hasRnaSeq}
                                />
                            </span>
                        </Tooltip>
                    </FormGroup>
                    <Button variant="contained" onClick={handleSubmit} disabled={!selected}>
                        Submit
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
