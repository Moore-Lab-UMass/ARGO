import { COMPASS_COLLECTIONS } from "@/lib/constants";

/** Starts a browser download of `href`. */
function triggerDownload(href: string, filename: string) {
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/** The first non-transparent background color at or above an element. */
function backgroundOf(el: HTMLElement): string {
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        const color = getComputedStyle(node).backgroundColor;
        if (color && color !== "transparent" && color !== "rgba(0, 0, 0, 0)") return color;
    }
    return "#ffffff";
}

/** Saves an element (e.g. a chart) as a PNG. */
export async function downloadChart(container: HTMLElement | null, filename = "chart.png") {
    if (!container) return;
    try {
        // loaded on demand: only needed when someone downloads a chart
        const { default: html2canvas } = await import("html2canvas");
        // Use the background the chart sits on, so light text in dark mode stays readable
        const canvas = await html2canvas(container, { backgroundColor: backgroundOf(container) });
        triggerDownload(canvas.toDataURL("image/png"), filename);
    } catch (err) {
        console.error("Failed to download chart", err);
    }
}

/** Downloads a compass collection's VCF file. */
export function downloadCollectionFile(collection: string) {
    const file = COMPASS_COLLECTIONS[collection]?.file;
    if (!file) return;
    triggerDownload(file, file.split("/").pop() ?? "collection.vcf");
}
