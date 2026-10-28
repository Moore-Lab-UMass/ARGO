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
import { GeneTableRow } from "@/types/rows";

const EMPTY: GeneTableRow[] = [];

/** Genes linked to each region's cCREs, with expression and specificity scores. */
export function useGeneRows(ccres: Ccre[] | undefined, filters: GeneFilterState) {
    const enabled = filters.useGenes;
    const method = filters.methodOfLinkage;
    const isDistance = method === "distance";
    const isComputational = isComputationalMethod(method);
    const accessions = useMemo(() => ccres?.map((c) => c.accession) ?? [], [ccres]);
    const linkage = filters.linkageBiosample;

    // 1. Which genes are linked to each cCRE (one query, depending on the linking method)
    const closest = useQuery(CLOSEST_QUERY, {
        variables: { accessions },
        skip: !enabled || !ccres || !isDistance,
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
        skip: !enabled || !ccres || isDistance || isComputational,
    });

    const computational = useQuery(COMPUTATIONAL_LNKED_GENES_QUERY, {
        variables: { accession: accessions, biosample_value: linkage ? linkage.name : [], method },
        skip: !enabled || !ccres || !isComputational,
    });

    const baseGenes = useMemo(
        () => buildLinkedGenes(ccres, { closest: closest.data, linked: linked.data, computational: computational.data }, filters),
        // only the filters that change which genes are linked
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [ccres, closest.data, linked.data, computational.data, method, filters.mustBeProteinCoding]
    );

    // 2. Optionally keep only genes with a mouse ortholog
    const geneNames = useMemo(() => uniqueGeneNames(baseGenes), [baseGenes]);
    const orthologs = useQuery(GENE_ORTHO_QUERY, {
        variables: { name: geneNames, assembly: "grch38" },
        skip: !enabled || !filters.mustHaveOrtholog || baseGenes.length === 0,
    });
    const waitingForOrthologs = filters.mustHaveOrtholog && orthologs.loading;
    const ccreGenes = useMemo(
        () => (filters.mustHaveOrtholog && orthologs.data ? filterOrthologGenes(orthologs.data, baseGenes) : baseGenes),
        [filters.mustHaveOrtholog, orthologs.data, baseGenes]
    );

    // 3. Expression and specificity scores for those genes
    const geneIds = useMemo(() => geneIdsForScores(ccreGenes), [ccreGenes]);
    const skipScores = !enabled || waitingForOrthologs || geneIds.length === 0;
    const specificity = useQuery(SPECIFICITY_QUERY, { variables: { geneids: geneIds }, skip: skipScores });
    const expression = useQuery(GENE_EXP_QUERY, {
        variables: {
            genes: geneIds,
            biosample: filters.selectedBiosample ? filters.selectedBiosample.name : [],
            aggregateBy: (filters.rankGeneExpBy === "avg" ? "AVERAGE" : "MAX") as AggregateByEnum,
        },
        skip: skipScores,
    });

    const loading =
        enabled &&
        (closest.loading || linked.loading || computational.loading || orthologs.loading || specificity.loading || expression.loading);
    const error = closest.error ?? linked.error ?? computational.error ?? expression.error;

    const rows = useMemo(() => {
        if (!enabled || !ccres || loading || error) return EMPTY;
        return buildGeneRows({ ccreGenes, ccres, specificity: specificity.data, expression: expression.data, filters });
    }, [enabled, ccres, loading, error, ccreGenes, specificity.data, expression.data, filters]);

    return { rows, loading, error };
}
