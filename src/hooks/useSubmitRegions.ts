import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { sortRegions } from "@/lib/regions/parse";
import { saveSubmission } from "@/lib/regions/session";
import { InputRegion } from "@/types/regions";

/** Sorts and saves the regions, then opens the results page. */
export function useSubmitRegions() {
    const router = useRouter();
    return useCallback(
        (regions: InputRegion[], fileName: string) => {
            saveSubmission(sortRegions(regions), fileName);
            router.push(`/submitted/${encodeURIComponent(fileName)}`);
        },
        [router]
    );
}
