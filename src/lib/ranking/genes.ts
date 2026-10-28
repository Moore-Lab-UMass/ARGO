import {
    ClosestAndLinkedQuery,
    ComputationalGeneLinksQuery,
    GeneOrthologQueryQuery,
    GeneSpecificityQuery,
    GetLinkedGenesQuery,
    Test_GeneEXpBiosampleQueryQuery,
} from "@/graphql/__generated__/graphql";
import { isComputationalMethod } from "@/lib/constants";
import { ComputationalMethod, GeneFilterState, GeneLinkingMethod } from "@/types/filters";
import { Ccre, InputRegion, RankedRegion } from "@/types/regions";
import { CcreGenes, GeneScore, GeneTableRow } from "@/types/rows";
import { zeroRanks } from "./aggregate";
import { coordKey, groupBy, indexBy, rankSorted } from "./rank";

type LinkedGeneResult = GetLinkedGenesQuery["linkedGenesQuery"][number];
type ComputationalGeneResult = ComputationalGeneLinksQuery["ComputationalGeneLinksQuery"][number];
type ClosestGeneResult = ClosestAndLinkedQuery["closestGenetocCRE"][number];
type GeneEntry = CcreGenes["genes"][number];

const stripSpaces = (name: string) => name.replace(/\s+/g, "");

/** Adds a gene to the cCRE's list unless a gene with the same id or name is already there. */
function addUniqueGene(map: Map<string, GeneEntry[]>, accession: string, gene: GeneEntry) {
    const genes = map.get(accession) ?? [];
    if (!map.has(accession)) map.set(accession, genes);
    if (!genes.some((g) => g.geneId === gene.geneId || g.name === gene.name)) genes.push(gene);
}

const toCcreGenes = (map: Map<string, GeneEntry[]>): CcreGenes[] =>
    Array.from(map, ([accession, genes]) => ({ accession, genes }));

/** Genes from experimental linkage (Hi-C, ChIA-PET, CRISPRi, eQTLs), grouped by cCRE. */
function parseLinkedGenes(data: LinkedGeneResult[], methodOfLinkage: GeneLinkingMethod): CcreGenes[] {
    const byAccession = new Map<string, GeneEntry[]>();
    for (const gene of data) {
        const method = (gene.assay ?? gene.method).replace(/-/g, "_");
        const genes = byAccession.get(gene.accession) ?? [];
        if (!byAccession.has(gene.accession)) byAccession.set(gene.accession, genes);
        if (!genes.some((g) => g.name === gene.gene && g.geneId === gene.geneid)) {
            // NOTE: genes linked by a different method get linkedBy [] (preserves existing
            // behavior; see refactor plan Phase 6).
            genes.push({
                name: gene.gene,
                geneId: gene.geneid,
                linkedBy: (methodOfLinkage === method ? method : []) as GeneLinkingMethod,
            });
        }
    }
    return toCcreGenes(byAccession);
}

/** Genes from computational models (ABC, rE2G, ...), matched to cCREs by coordinates. */
function parseComputationalGenes(data: ComputationalGeneResult[], method: ComputationalMethod, ccres: Ccre[]): CcreGenes[] {
    const ccreByCoords = indexBy(ccres, coordKey);
    const byAccession = new Map<string, GeneEntry[]>();
    for (const gene of data) {
        const [chr, start, end] = gene.methodregion.split("_");
        const accession = ccreByCoords.get(coordKey({ chr, start: parseInt(start, 10), end: parseInt(end, 10) }))?.accession;
        if (!accession) continue;
        addUniqueGene(byAccession, accession, { name: gene.gene, geneId: gene.geneid, linkedBy: method });
    }
    return toCcreGenes(byAccession);
}

/** The closest gene to each cCRE. */
function parseClosestGenes(data: ClosestGeneResult[]): CcreGenes[] {
    const byAccession = new Map<string, GeneEntry[]>();
    for (const closest of data) {
        const accession = closest.ccre;
        const name = closest.gene?.name;
        const geneId = closest.gene?.geneid;
        if (!accession || !name || !geneId) continue;
        addUniqueGene(byAccession, accession, { name, geneId, linkedBy: "distance" });
    }
    return toCcreGenes(byAccession);
}

type LinkedGenesData = {
    closest?: ClosestAndLinkedQuery;
    linked?: GetLinkedGenesQuery;
    computational?: ComputationalGeneLinksQuery;
};

/** Genes linked to each cCRE by the selected method, or [] while that method's data is missing. */
export function buildLinkedGenes(ccres: Ccre[] | undefined, data: LinkedGenesData, filters: GeneFilterState): CcreGenes[] {
    const method = filters.methodOfLinkage;
    if (!ccres) return [];

    if (method === "distance") {
        if (!data.closest) return [];
        const type = filters.mustBeProteinCoding ? "PC" : "ALL";
        return parseClosestGenes(data.closest.closestGenetocCRE.filter((g) => g.gene.type === type));
    }

    if (isComputationalMethod(method)) {
        if (!data.computational) return [];
        const genes = data.computational.ComputationalGeneLinksQuery;
        const filtered = filters.mustBeProteinCoding ? genes.filter((g) => g.genetype === "protein_coding") : genes;
        return parseComputationalGenes(filtered, method, ccres);
    }

    if (!data.linked) return [];
    // CRISPRi-FlowFISH links only count when significant
    let genes = data.linked.linkedGenesQuery.filter((g) => g.assay !== "CRISPRi-FlowFISH" || g.p_val < 0.05);
    if (filters.mustBeProteinCoding) genes = genes.filter((g) => g.genetype === "protein_coding");
    return parseLinkedGenes(genes, method);
}

/** Keeps only genes that have a mouse ortholog; drops cCREs left with no genes. */
export function filterOrthologGenes(orthoGenes: GeneOrthologQueryQuery, ccreGenes: CcreGenes[]): CcreGenes[] {
    const withOrtholog = new Set(orthoGenes.geneOrthologQuery.map((o) => o.humanGene));
    return ccreGenes
        .map((item) => ({ ...item, genes: item.genes.filter((g) => withOrtholog.has(stripSpaces(g.name))) }))
        .filter((item) => item.genes.length > 0);
}

/** Unique gene names across all cCREs, for the ortholog query. */
export const uniqueGeneNames = (ccreGenes: CcreGenes[]) =>
    Array.from(new Set(ccreGenes.flatMap((item) => item.genes.map((g) => g.name.trim()))));

/** Gene ids without version suffix, for the specificity and expression queries. */
export const geneIdsForScores = (ccreGenes: CcreGenes[]) =>
    ccreGenes.flatMap((entry) => entry.genes.map((g) => g.geneId.split(".")[0]));

/** Max-scoring gene, or the average across genes; undefined when there are no genes. */
function summarize(scores: GeneScore[], rankBy: "max" | "avg"): GeneScore | undefined {
    if (scores.length === 0) return undefined;
    if (rankBy === "max") return scores.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
    const avg = scores.reduce((sum, { score }) => sum + score, 0) / scores.length;
    return { geneName: "Average", score: avg, linkedBy: scores[0].linkedBy };
}

type BuildGeneRowsArgs = {
    ccreGenes: CcreGenes[];
    ccres: Ccre[];
    specificity?: GeneSpecificityQuery;
    expression?: Test_GeneEXpBiosampleQueryQuery;
    filters: GeneFilterState;
};

/**
 * One gene table row per input region, once both specificity and expression scores have loaded.
 * Genes from all of the region's cCREs are pooled (each gene counted once), and the region's
 * expression and specificity are the max or average over the pooled genes linked by the selected method.
 */
export function buildGeneRows({ ccreGenes, ccres, specificity, expression, filters }: BuildGeneRowsArgs): GeneTableRow[] {
    if (ccreGenes.length === 0 || !specificity || !expression) return [];

    const specificityByName = indexBy(specificity.geneSpecificity, (g) => stripSpaces(g.name));
    const expressionByName = indexBy(expression.geneexpressiontpms, (g) => g.gene);
    const genesByAccession = groupBy(ccreGenes, (item) => item.accession);
    const ccresByRegion = groupBy(
        ccres.filter((c) => c.regionID !== undefined),
        (c) => c.regionID
    );

    const rows: GeneTableRow[] = [];
    for (const [regionID, regionCcres] of ccresByRegion) {
        // Every gene linked to any of the region's cCREs, once each
        const genes = new Map<string, { gene: GeneEntry; accession: string }>();
        for (const ccre of regionCcres) {
            for (const item of genesByAccession.get(ccre.accession) ?? []) {
                for (const gene of item.genes) {
                    if (!genes.has(gene.geneId)) genes.set(gene.geneId, { gene, accession: item.accession });
                }
            }
        }
        if (genes.size === 0) continue;

        const linkedByMethod = [...genes.values()].filter(({ gene }) => gene.linkedBy === filters.methodOfLinkage);
        const scoresFrom = (score: (gene: GeneEntry) => number | null | undefined): GeneScore[] =>
            linkedByMethod.map(({ gene }) => ({ geneName: gene.name, score: score(gene) || 0, linkedBy: gene.linkedBy }));

        rows.push({
            regionID,
            inputRegion: regionCcres[0].inputRegion,
            expressionSpecificity: summarize(
                scoresFrom((g) => specificityByName.get(stripSpaces(g.name))?.score),
                filters.rankExpSpecBy
            ),
            geneExpression: summarize(
                scoresFrom((g) => expressionByName.get(stripSpaces(g.name))?.tpm),
                filters.rankGeneExpBy
            ),
            linkedGenes: [...genes.values()].map(({ gene, accession }) => ({
                accession,
                name: gene.name,
                geneid: gene.geneId,
                linkedBy: gene.linkedBy,
            })),
        });
    }
    return rows;
}

/**
 * Ranks regions by the sum of three sub-ranks: expression specificity, gene expression
 * (both higher is better) and number of linked genes (most or least, per the filter).
 */
export function rankGenes(rows: GeneTableRow[], filters: GeneFilterState, regions: InputRegion[]): RankedRegion[] {
    if (!filters.useGenes) return zeroRanks(regions);
    if (rows.length === 0) return [];

    const linkedCount = (row: GeneTableRow) => row.linkedGenes?.length ?? 0;
    const expression = (row: GeneTableRow) => row.geneExpression?.score ?? 0;
    const specificity = (row: GeneTableRow) => row.expressionSpecificity?.score ?? 0;

    const specificityRanks = rankSorted(rows, (a, b) => specificity(b) - specificity(a), specificity);
    const expressionRanks = indexBy(rankSorted(rows, (a, b) => expression(b) - expression(a), expression), (r) => r.item.regionID);
    const linkedRanks = indexBy(
        rankSorted(
            rows,
            (a, b) => (filters.rankLinkedBy === "most" ? linkedCount(b) - linkedCount(a) : linkedCount(a) - linkedCount(b)),
            linkedCount
        ),
        (r) => r.item.regionID
    );

    const totals = specificityRanks.map(({ item, rank }) => ({
        row: item,
        total: rank + (expressionRanks.get(item.regionID)?.rank ?? 0) + (linkedRanks.get(item.regionID)?.rank ?? 0),
    }));

    return rankSorted(totals, (a, b) => a.total - b.total, (t) => t.total).map(({ item, rank }) => ({
        chr: item.row.inputRegion.chr,
        start: item.row.inputRegion.start,
        end: item.row.inputRegion.end,
        regionID: item.row.regionID,
        rank: item.total === 0 ? 0 : rank,
    }));
}
