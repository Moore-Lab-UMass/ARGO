import {
    GetcCreDetailsQuery,
    GetcCreZscoresDetailsQuery,
    OrthoQueryQuery,
} from "@/graphql/__generated__/graphql";
import { ASSAYS } from "@/lib/constants";
import { CCREAssays, CCREClasses, ElementFilterState } from "@/types/filters";
import { Ccre, InputRegion, RankedRegion } from "@/types/regions";
import { ElementTableRow } from "@/types/rows";
import { zeroRanks } from "./aggregate";
import { groupBy, indexBy, rankSorted } from "./rank";

/** Human cCRE accession → its mouse ortholog accession (first ortholog only). */
export function buildOrthologMap(orthoData?: OrthoQueryQuery): Record<string, string> {
    if (!orthoData) return {};
    const map: Record<string, string> = {};
    for (const entry of orthoData.orthologQuery) {
        if (entry.ortholog.length > 0) map[entry.accession] = entry.ortholog[0].accession;
    }
    return map;
}

type ZScoreRow = GetcCreDetailsQuery["getmaxZScoresQuery"][number];

type BuildElementRowsArgs = {
    ccres: Ccre[];
    maxZScores?: GetcCreDetailsQuery;
    biosampleZScores?: GetcCreZscoresDetailsQuery;
    orthologs?: OrthoQueryQuery;
    filters: ElementFilterState;
};

/**
 * One element table row per overlapping cCRE, with its class and assay z-scores.
 * Biosample-specific z-scores replace the max z-scores when a biosample is selected.
 * For mm10, each human cCRE is swapped for its mouse ortholog.
 */
export function buildElementRows({ ccres, maxZScores, biosampleZScores, orthologs, filters }: BuildElementRowsArgs): ElementTableRow[] {
    if (!maxZScores) return [];

    const maxData = maxZScores.getmaxZScoresQuery ?? [];
    const biosampleData = biosampleZScores?.getcCREZScoresQuery;
    const orthoMap = buildOrthologMap(orthologs);

    let scores: ZScoreRow[] = maxData;
    if (biosampleData) {
        const biosampleByAccession = indexBy(biosampleData, (b) => b?.accession);
        scores = maxData.map((maxItem) => {
            const b = biosampleByAccession.get(maxItem?.accession);
            if (!b) return maxItem;
            return {
                ...maxItem,
                dnase_max_zscore: b.dnase_max_zscore,
                ctcf_max_zscore: b.ctcf_max_zscore,
                atac_max_zscore: b.atac_max_zscore,
                h3k4me3_max_zscore: b.h3k4me3_max_zscore,
                h3k27ac_max_zscore: b.h3k27ac_max_zscore,
            };
        });
    }
    const scoresByAccession = indexBy(scores, (s) => s.accession);

    const baseCcres = filters.cCREAssembly === "mm10"
        ? ccres.map((ccre) => ({ ...ccre, accession: orthoMap[ccre.accession] })).filter((ccre) => ccre.accession)
        : ccres;

    let rows = baseCcres.map((ccre) => {
        const s = scoresByAccession.get(ccre.accession);
        if (!s) return ccre as unknown as ElementTableRow;
        return {
            ...ccre,
            dnase: s.dnase_max_zscore,
            h3k4me3: s.h3k4me3_max_zscore,
            h3k27ac: s.h3k27ac_max_zscore,
            ctcf: s.ctcf_max_zscore,
            atac: s.atac_max_zscore,
            class: s.ccre_group,
        } as ElementTableRow;
    });

    if (filters.mustHaveOrtholog && filters.cCREAssembly !== "mm10") {
        rows = rows.map((row) => ({ ...row, ortholog: orthoMap[row.accession] })).filter((row) => row.ortholog);
    }

    return rows.filter((row) => filters.classes[row.class] !== false);
}

const isScore = (v: unknown): v is number => typeof v === "number" && !isNaN(v);

/**
 * Combines the cCREs overlapping each input region into one row per region: each assay's
 * z-score is the max or average over the cCREs that have one. Only cCREs of an enabled class count.
 */
function combineByRegion(rankBy: ElementFilterState["rankBy"], rows: ElementTableRow[], classes: CCREClasses): ElementTableRow[] {
    return Array.from(groupBy(rows, (row) => row.regionID).values(), (group) => {
        const classified = group.filter((row) => classes[row.class]);
        const combined: ElementTableRow = { ...group[0] };
        for (const assay of ASSAYS) {
            const values = classified.map((row) => row[assay]).filter(isScore);
            combined[assay] =
                values.length === 0
                    ? undefined
                    : rankBy === "max"
                      ? Math.max(...values)
                      : values.reduce((sum, v) => sum + v, 0) / values.length;
        }
        return combined;
    });
}

/**
 * Ranks regions by their assay z-scores. Each enabled assay ranks the regions (highest z-score
 * first, ties share a rank, regions without a score last); the assay ranks are summed and the
 * regions ordered by that sum. Regions with no score for any enabled assay are unranked (0).
 */
function rankByAssays(rows: ElementTableRow[], assays: CCREAssays): RankedRegion[] {
    const totals = rows.map((row) => ({ row, total: 0, scored: false }));

    for (const assay of ASSAYS.filter((a) => assays[a])) {
        const withScore = totals.filter((t) => isScore(t.row[assay]));
        const ranks = new Map(
            rankSorted(withScore, (a, b) => b.row[assay] - a.row[assay], (t) => t.row[assay]).map(({ item, rank }) => [item, rank])
        );
        const lastPlace = withScore.length + 1;
        for (const t of totals) {
            const rank = ranks.get(t);
            t.total += rank ?? lastPlace;
            if (rank !== undefined) t.scored = true;
        }
    }

    const toRanked = ({ row }: (typeof totals)[number], rank: number): RankedRegion => ({
        ...row.inputRegion,
        regionID: row.regionID,
        rank,
    });
    const scored = totals.filter((t) => t.scored);
    return [
        ...rankSorted(scored, (a, b) => a.total - b.total, (t) => t.total).map(({ item, rank }) => toRanked(item, rank)),
        ...totals.filter((t) => !t.scored).map((t) => toRanked(t, 0)),
    ];
}

export function rankElements(rows: ElementTableRow[], filters: ElementFilterState, regions: InputRegion[]): RankedRegion[] {
    if (!filters.usecCREs) return zeroRanks(regions);
    if (rows.length === 0) return [];
    return rankByAssays(combineByRegion(filters.rankBy, rows, filters.classes), filters.assays);
}
