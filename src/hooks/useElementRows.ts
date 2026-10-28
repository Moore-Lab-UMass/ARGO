import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { BIOSAMPLE_Z_SCORES_QUERY, MAX_Z_SCORES_QUERY, ORTHOLOG_QUERY } from "@/lib/graphql/queries";
import { buildElementRows } from "@/lib/ranking/elements";
import { ElementFilterState } from "@/types/filters";
import { Ccre } from "@/types/regions";
import { ElementTableRow } from "@/types/rows";

const EMPTY: ElementTableRow[] = [];

/** Class and assay z-scores for each overlapping cCRE (or its mouse ortholog for mm10). */
export function useElementRows(ccres: Ccre[] | undefined, filters: ElementFilterState) {
    const enabled = filters.usecCREs;
    const isMouse = filters.cCREAssembly === "mm10";
    const accessions = useMemo(() => ccres?.map((c) => c.accession) ?? [], [ccres]);

    // Human → mouse orthologs: needed for mm10 and for the "must have ortholog" filter
    const orthologs = useQuery(ORTHOLOG_QUERY, {
        variables: { assembly: "GRCh38", accessions },
        skip: !enabled || !ccres || (!filters.mustHaveOrtholog && !isMouse),
    });

    const mouseAccessions = useMemo(
        () => (isMouse ? orthologs.data?.orthologQuery?.flatMap((e) => e.ortholog).map((o) => o.accession) : undefined),
        [isMouse, orthologs.data]
    );
    const accessionList = isMouse ? mouseAccessions : accessions;
    const waitingForMouse = isMouse && !mouseAccessions;

    const maxZScores = useQuery(MAX_Z_SCORES_QUERY, {
        variables: { assembly: filters.cCREAssembly, accession: accessionList },
        skip: !enabled || !ccres || waitingForMouse,
    });

    const biosampleZScores = useQuery(BIOSAMPLE_Z_SCORES_QUERY, {
        variables: {
            assembly: filters.cCREAssembly,
            accession: accessionList,
            biosample_value: filters.selectedBiosample ? [filters.selectedBiosample.name] : [],
        },
        skip: !enabled || !ccres || !filters.selectedBiosample || waitingForMouse,
    });

    const loading = enabled && (orthologs.loading || maxZScores.loading || biosampleZScores.loading);
    const error = orthologs.error ?? maxZScores.error ?? biosampleZScores.error;

    const rows = useMemo(() => {
        if (!enabled || !ccres || loading || error) return EMPTY;
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
