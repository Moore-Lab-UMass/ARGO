import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { AggregateByEnum } from "@/graphql/__generated__/graphql";
import { isComputationalMethod } from "@/lib/constants";
import {
    CLOSEST_QUERY,
    COMPUTATIONAL_LNKED_GENES_QUERY,
    GENE_EXP_QUERY,
    GENE_ORTHO_QUERY,
    LINKED_GENES_QUERY,
    SPECIFICITY_QUERY,
} from "@/lib/graphql/queries";
import { buildGeneRows, buildLinkedGenes, filterOrthologGenes, geneIdsForScores, uniqueGeneNames } from "@/lib/ranking/genes";
import { GeneFilterState } from "@/types/filters";
import { Ccre } from "@/types/regions";
import { CcreGenes, GeneTableRow } from "@/types/rows";
import { anyLoading, firstError } from "./queryStatus";

const EMPTY: GeneTableRow[] = [];

/** Genes linked to each region's cCREs, with expression and specificity scores. */
export function useGeneRows(ccres: Ccre[] | undefined, filters: GeneFilterState) {
    const enabled = filters.useGenes;

    const { linkQueries, baseGenes } = useLinkedGenes(ccres, filters);
    const { orthologs, ccreGenes, waitingForOrthologs } = useOrthologGenes(baseGenes, filters);
    const { specificity, expression } = useGeneScores(ccreGenes, filters, enabled && !waitingForOrthologs);

    const loading = enabled && anyLoading([...linkQueries, orthologs, specificity, expression]);
    // Ortholog and specificity failures aren't reported: rows are still built without them
    const error = firstError([...linkQueries, expression]);

    const rows = useMemo(() => {
        if (!ccres || !enabled || loading || error) return EMPTY;
        return buildGeneRows({ ccreGenes, ccres, specificity: specificity.data, expression: expression.data, filters });
    }, [enabled, ccres, loading, error, ccreGenes, specificity.data, expression.data, filters]);

    return { rows, loading, error };
}

/** 1. Which genes are linked to each cCRE (one query, depending on the linking method). */
function useLinkedGenes(ccres: Ccre[] | undefined, filters: GeneFilterState) {
    const active = filters.useGenes && ccres !== undefined;
    const method = filters.methodOfLinkage;
    const isDistance = method === "distance";
    const isComputational = isComputationalMethod(method);
    const accessions = useMemo(() => ccres?.map((c) => c.accession) ?? [], [ccres]);
    const linkage = filters.linkageBiosample;

    const closest = useQuery(CLOSEST_QUERY, {
        variables: { accessions },
        skip: !active || !isDistance,
    });

    const linkedVariables = useMemo(
        () =>
            method === "eQTLs"
                ? { accession: accessions, assembly: "grch38", tissue: linkage ? linkage.displayname : [], method: "eQTLs" }
                : { accession: accessions, assembly: "grch38", celltype: linkage ? linkage.cellType : [], assaytype: method.replace("_", "-") },
        [accessions, method, linkage]
    );
    const linked = useQuery(LINKED_GENES_QUERY, {
        variables: linkedVariables,
        skip: !active || isDistance || isComputational,
    });

    const computational = useQuery(COMPUTATIONAL_LNKED_GENES_QUERY, {
        variables: { accession: accessions, biosample_value: linkage ? linkage.name : [], method },
        skip: !active || !isComputational,
    });

    const baseGenes = useMemo(
        () => buildLinkedGenes(ccres, { closest: closest.data, linked: linked.data, computational: computational.data }, filters),
        // only the filters that change which genes are linked
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ccres, closest.data, linked.data, computational.data, method, filters.mustBeProteinCoding]
    );

    return { linkQueries: [closest, linked, computational], baseGenes };
}

/** 2. Optionally keep only genes with a mouse ortholog. */
function useOrthologGenes(baseGenes: CcreGenes[], filters: GeneFilterState) {
    const required = filters.mustHaveOrtholog;
    const geneNames = useMemo(() => uniqueGeneNames(baseGenes), [baseGenes]);

    const orthologs = useQuery(GENE_ORTHO_QUERY, {
        variables: { name: geneNames, assembly: "grch38" },
        skip: !filters.useGenes || !required || baseGenes.length === 0,
    });

    const ccreGenes = useMemo(
        () => (required && orthologs.data ? filterOrthologGenes(orthologs.data, baseGenes) : baseGenes),
        [required, orthologs.data, baseGenes]
    );

    return { orthologs, ccreGenes, waitingForOrthologs: required && orthologs.loading };
}

/** 3. Expression and specificity scores for the linked genes. */
function useGeneScores(ccreGenes: CcreGenes[], filters: GeneFilterState, active: boolean) {
    const geneIds = useMemo(() => geneIdsForScores(ccreGenes), [ccreGenes]);
    const skip = !active || geneIds.length === 0;

    const specificity = useQuery(SPECIFICITY_QUERY, { variables: { geneids: geneIds }, skip });
    const expression = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: geneIds,
            biosample: filters.selectedBiosample ? filters.selectedBiosample.name : [],
            aggregateBy: (filters.rankGeneExpBy === "avg" ? "AVERAGE" : "MAX") as AggregateByEnum,
        },
        skip,
    });

    return { specificity, expression };
}
