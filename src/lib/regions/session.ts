import pako from "pako";
import { InputRegion } from "@/types/regions";

// The submission is passed from the upload page to the results page through sessionStorage,
// compressed so large files fit within the storage quota.
const REGIONS_KEY = "encodedRegions";
const FILE_NAME_KEY = "fileName";

function toBase64Url(bytes: Uint8Array): string {
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(encoded: string): Uint8Array {
    const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export const encodeRegions = (regions: InputRegion[]): string => toBase64Url(pako.deflate(JSON.stringify(regions)));

export const decodeRegions = (encoded: string): InputRegion[] =>
    JSON.parse(pako.inflate(fromBase64Url(encoded), { to: "string" }));

export function saveSubmission(regions: InputRegion[], fileName: string) {
    sessionStorage.setItem(REGIONS_KEY, encodeRegions(regions));
    sessionStorage.setItem(FILE_NAME_KEY, fileName);
}

/** The current submission, or null if there is none (or it can't be read). */
export function loadSubmission(): { regions: InputRegion[]; fileName: string | null } | null {
    const encoded = sessionStorage.getItem(REGIONS_KEY);
    if (!encoded) return null;
    try {
        return { regions: decodeRegions(encoded), fileName: sessionStorage.getItem(FILE_NAME_KEY) };
    } catch (err) {
        console.error("Failed to read submitted regions:", err);
        return null;
    }
}
