import { useState } from "react";
import { CircularProgress, Link, Stack, Typography } from "@mui/material";
import { useSubmitRegions } from "@/hooks/useSubmitRegions";
import { parseRegionsTsv } from "@/lib/regions/parse";
import { BRAND } from "@/lib/colors";
import { EXAMPLES } from "@/lib/constants";

/** "Try an example" links that submit one of the example files in /public. */
export default function ExampleLinks() {
    const submitRegions = useSubmitRegions();
    const [loading, setLoading] = useState<string | null>(null);

    const runExample = async (url: string) => {
        setLoading(url);
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const fileName = url.replaceAll("/", "").split(".")[0];
            submitRegions(parseRegionsTsv(await response.text()), fileName);
        } catch (error) {
            console.error("Failed to load example file:", error);
            setLoading(null);
        }
    };

    return (
        <Stack direction="row" flexWrap="wrap" alignItems="center" columnGap={1.5} rowGap={0.5}>
            <Typography variant="body2" color="text.secondary">
                No file yet? Try an example:
            </Typography>
            {EXAMPLES.map(({ name, file }) => (
                <Link
                    key={file}
                    component="button"
                    type="button"
                    variant="body2"
                    disabled={loading !== null}
                    onClick={() => runExample(file)}
                    sx={{ fontWeight: 600, color: BRAND.link, display: "inline-flex", alignItems: "center", gap: 0.5 }}
                >
                    {name}
                    {loading === file && <CircularProgress size={12} />}
                </Link>
            ))}
        </Stack>
    );
}
