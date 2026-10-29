import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { BIOSAMPLE_Z_SCORES_QUERY, MAX_Z_SCORES_QUERY, ORTHOLOG_QUERY } from "@/lib/graphql/queries";
import { buildElementRows } from "@/lib/ranking/elements";
import { ElementFilterState } from "@/types/filters";
import { Ccre } from "@/types/regions";
import { ElementTableRow } from "@/types/rows";
import { anyLoading, firstError } from "./queryStatus";

const EMPTY: ElementTableRow[] = [];

/** Class and assay z-scores for each overlapping cCRE (or its mouse ortholog for mm10). */
export function useElementRows(ccres: Ccre[] | undefined, filters: ElementFilterState) {
    const enabled = filters.usecCREs;
    const active = enabled && ccres !== undefined;
    const accessions = useMemo(() => ccres?.map((c) => c.accession) ?? [], [ccres]);

    const { orthologs, scoredAccessions, waitingForMouse } = useScoredAccessions(accessions, filters, active);
    const { maxZScores, biosampleZScores } = useZScores(scoredAccessions, filters, active && !waitingForMouse);

    const queries = [orthologs, maxZScores, biosampleZScores];
    const loading = enabled && anyLoading(queries);
    const error = firstError(queries);

    const rows = useMemo(() => {
        if (!ccres || !enabled || loading || error) return EMPTY;
        return buildElementRows({
            ccres,
            maxZScores: maxZScores.data,
            biosampleZScores: biosampleZScores.data,
            orthologs: orthologs.data,
            filters,
        });
    }, [enabled, ccres, loading, error, maxZScores.data, biosampleZScores.data, orthologs.data, filters]);

    return { rows, loading, error };
}

/**
 * Human → mouse cCRE orthologs (needed for mm10 and for the "must have ortholog" filter),
 * and the accessions to fetch scores for: the mouse orthologs for mm10, otherwise the human cCREs.
 */
function useScoredAccessions(accessions: string[], filters: ElementFilterState, active: boolean) {
    const isMouse = filters.cCREAssembly === "mm10";
    const needed = isMouse || filters.mustHaveOrtholog;

    const orthologs = useQuery(ORTHOLOG_QUERY, {
        variables: { assembly: "GRCh38", accessions },
        skip: !active || !needed,
    });

    const mouseAccessions = useMemo(
        () => (isMouse ? orthologs.data?.orthologQuery?.flatMap((e) => e.ortholog).map((o) => o.accession) : undefined),
        [isMouse, orthologs.data]
    );

    return {
        orthologs,
        scoredAccessions: isMouse ? mouseAccessions : accessions,
        waitingForMouse: isMouse && !mouseAccessions,
    };
}

/** Max z-scores across biosamples, and z-scores in the selected biosample (if any). */
function useZScores(accessions: string[] | undefined, filters: ElementFilterState, active: boolean) {
    const maxZScores = useQuery(MAX_Z_SCORES_QUERY, {
        variables: { assembly: filters.cCREAssembly, accession: accessions },
        skip: !active,
    });

    const biosample = filters.selectedBiosample;
    const biosampleZScores = useQuery(BIOSAMPLE_Z_SCORES_QUERY, {
        variables: { assembly: filters.cCREAssembly, accession: accessions, biosample_value: biosample ? [biosample.name] : [] },
        skip: !active || !biosample,
    });

    return { maxZScores, biosampleZScores };
}
