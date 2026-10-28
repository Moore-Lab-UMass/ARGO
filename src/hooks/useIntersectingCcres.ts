import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { BED_INTERSECT_QUERY } from "@/lib/graphql/queries";
import { toCcres } from "@/lib/regions/intersect";
import { Ccre, InputRegion } from "@/types/regions";

/** cCREs overlapping the given regions (undefined until loaded). */
export function useIntersectingCcres(regions: InputRegion[], { skip = false } = {}) {
    const userCcres = useMemo(() => regions.map((r) => [r.chr, r.start.toString(), r.end.toString()]), [regions]);

    const { data, loading, error } = useQuery(BED_INTERSECT_QUERY, {
        variables: { user_ccres: userCcres, assembly: "GRCh38" },
        skip: skip || regions.length === 0,
    });

    const ccres: Ccre[] | undefined = useMemo(
        () => (data && !loading ? toCcres(data.intersection, regions) : undefined),
        [data, loading, regions]
    );

    return { ccres, loading, error };
}
