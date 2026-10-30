import { useEffect, useState } from "react";
import { COMPASS_COLLECTIONS } from "@/lib/constants";
import { parseCompassVcf } from "@/lib/regions/parse";
import { InputRegion } from "@/types/regions";

const EMPTY: InputRegion[] = [];

/** The variants in a compass collection (fetched from /public). */
export function useCompassRegions(collection: string) {
    const [state, setState] = useState<{ collection: string; regions: InputRegion[] } | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(COMPASS_COLLECTIONS[collection].file)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.text();
            })
            .then((text) => !cancelled && setState({ collection, regions: parseCompassVcf(text) }))
            .catch((err) => {
                console.error(`Failed to load compass collection ${collection}:`, err);
                if (!cancelled) setState({ collection, regions: EMPTY });
            });
        return () => {
            cancelled = true;
        };
    }, [collection]);

    const ready = state?.collection === collection;
    return { regions: ready ? state.regions : EMPTY, loading: !ready };
}
