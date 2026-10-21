import {
    GetcCreDetailsQuery,
    GetcCreZscoresDetailsQuery,
    OrthoQueryQuery,
} from "@/graphql/__generated__/graphql";
import { ASSAYS } from "@/lib/constants";
import { CCREAssays, CCREClasses, ElementFilterState } from "@/types/filters";
import { Ccre, InputRegion, RankedRegion, RegionID } from "@/types/regions";
import { ElementTableRow } from "@/types/rows";
import { zeroRanks } from "./aggregate";
import { indexBy, rankSorted } from "./rank";

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

/** Combines cCREs that overlap the same input region into one row, by max or average z-score. */
function combineByInputRegion(rankBy: ElementFilterState["rankBy"], rows: ElementTableRow[]): ElementTableRow[] {
    const groups: Record<string, ElementTableRow & { count: number }> = {};

    for (const row of rows) {
        const key = String(row.regionID);
        if (!groups[key]) {
            groups[key] = { ...row, count: 0 };
            for (const assay of ASSAYS) groups[key][assay] = rankBy === "max" ? row[assay] : 0;
        }
        const group = groups[key];
        for (const assay of ASSAYS) {
            group[assay] = rankBy === "avg" ? group[assay] + (row[assay] || 0) : Math.max(group[assay], row[assay] || 0);
        }
        if (rankBy === "avg") group.count += 1;
    }

    return Object.values(groups).map((group) => {
        const combined: Partial<ElementTableRow> = {};
        for (const assay of ASSAYS) {
            combined[assay] = rankBy === "avg" ? (group.count > 0 ? group[assay] / group.count : 0) : group[assay];
        }
        return { ...group, ...combined, count: undefined };
    });
}

/**
 * Ranks input regions by their cCREs' assay z-scores: each enabled assay gives a rank,
 * the ranks are summed, and regions are ordered by that sum.
 */
function rankByAssays(rows: ElementTableRow[], classes: CCREClasses, assays: CCREAssays): RankedRegion[] {
    // NOTE: preserves existing behavior; see refactor plan Phase 6. `rows` is sorted in place once
    // per assay with a comparator that treats disabled classes as equal, so the resulting order
    // depends on that exact sequence of sorts.
    const assayRanks = new Map<RegionID, { chr: string; start: number; end: number; regionID: RegionID; ranks: Record<string, number> }>();

    for (const assay of ASSAYS) {
        rows.sort((a, b) => (classes[a.class] && classes[b.class] ? b[assay] - a[assay] : 0));
        rows.forEach((row, index) => {
            const key = row.regionID;
            if (!assayRanks.has(key)) assayRanks.set(key, { ...row.inputRegion, regionID: row.regionID, ranks: {} });
            assayRanks.get(key).ranks[assay] = classes[row.class] && row[assay] !== null ? index + 1 : 0;
        });
    }

    const totals = Array.from(assayRanks.values(), (region) => ({
        region,
        total: ASSAYS.reduce((sum, assay) => (assays[assay] ? sum + (region.ranks[assay] || 0) : sum), 0),
    }));

    return rankSorted(totals, (a, b) => a.total - b.total, (t) => t.total).map(({ item, rank }) => ({
        chr: item.region.chr,
        start: item.region.start,
        end: item.region.end,
        regionID: item.region.regionID,
        rank: item.total === 0 ? 0 : rank,
    }));
}

export function rankElements(rows: ElementTableRow[], filters: ElementFilterState, regions: InputRegion[]): RankedRegion[] {
    if (!filters.usecCREs) return zeroRanks(regions);
    if (rows.length === 0) return [];
    return rankByAssays(combineByInputRegion(filters.rankBy, rows), filters.classes, filters.assays);
}
