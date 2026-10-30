import { FormEvent, KeyboardEvent, ReactNode, useState } from "react";
import { Alert, Box, Button, IconButton, Link, Stack, TextField, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { useDropzone } from "react-dropzone";
import { BRAND } from "@/lib/colors";
import { MONO_FONT } from "@/app/theme";

type Mode = "file" | "text";

type UploadFormProps = {
    /** Validates and submits the text; resolves to an error message, or null on success */
    onSubmit: (text: string, fileName: string) => Promise<string | null>;
    /** Name used for text box submissions */
    textSubmissionName: string;
    /** Placeholder for the paste box */
    textPlaceholder: string;
    /** Describes the expected format, shown under the drop zone */
    format: ReactNode;
    /** Shown under the submit button, e.g. example files */
    footer?: ReactNode;
    /** Called whenever the form is cleared */
    onReset?: () => void;
};

const MAX_FILE_NAME = 40;
const ZONE_HEIGHT = 200;

/** Inserts a tab at the cursor instead of moving focus, so pasted spreadsheet rows can be edited. */
function insertTab(event: KeyboardEvent<HTMLDivElement>, text: string, setText: (t: string) => void) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    setText(text.slice(0, start) + "\t" + text.slice(target.selectionEnd));
    requestAnimationFrame(() => (target.selectionStart = target.selectionEnd = start + 1));
}

/** Small text button that looks like an inline link. */
function InlineLink({ onClick, children }: { onClick: () => void; children: ReactNode }) {
    return (
        <Link
            component="button"
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            sx={{ fontWeight: 600, color: BRAND.link, verticalAlign: "baseline", font: "inherit" }}
        >
            {children}
        </Link>
    );
}

/** Drop a .tsv file or paste rows, then submit. Shared by both upload methods on the home page. */
export default function UploadForm({ onSubmit, textSubmissionName, textPlaceholder, format, footer, onReset }: UploadFormProps) {
    const [mode, setMode] = useState<Mode>("file");
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        onDrop: (files) => {
            const dropped = files[0] ?? null;
            const isTsv = dropped?.name.split(".").pop() === "tsv";
            setFile(isTsv ? dropped : null);
            setError(dropped && !isTsv ? "File type is not tsv" : null);
        },
        multiple: false,
    });

    const reset = (nextMode: Mode = mode) => {
        setMode(nextMode);
        setText("");
        setFile(null);
        setError(null);
        onReset?.();
    };

    const submit = async (getText: () => Promise<string>, fileName: string) => {
        setLoading(true);
        setError(null);
        onReset?.();
        try {
            setError(await onSubmit(await getText(), fileName));
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Something went wrong while reading your data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (mode === "text") {
            submit(async () => text, textSubmissionName);
            return;
        }
        if (!file) return;
        submit(() => file.text(), file.name.split(".")[0]);
    };

    const canSubmit = mode === "text" ? text.trim() !== "" : file !== null;

    return (
        <Stack component="form" onSubmit={handleSubmit} gap={2.5} width="100%">
            {mode === "text" ? (
                <Box>
                    <TextField
                        multiline
                        fullWidth
                        minRows={7}
                        maxRows={7}
                        autoFocus
                        placeholder={textPlaceholder}
                        onKeyDown={(e) => insertTab(e, text, setText)}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        slotProps={{ input: { sx: { fontFamily: MONO_FONT, fontSize: 13 } } }}
                    />
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        or <InlineLink onClick={() => reset("file")}>upload a file</InlineLink> instead
                    </Typography>
                </Box>
            ) : (
                <Box
                    {...getRootProps()}
                    sx={{
                        height: ZONE_HEIGHT,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        px: 2,
                        textAlign: "center",
                        borderRadius: 2,
                        border: "2px dashed",
                        borderColor: isDragActive ? BRAND.link : BRAND.borderStrong,
                        backgroundColor: isDragActive ? BRAND.selectedRow : BRAND.subtle,
                        cursor: "pointer",
                        transition: "border-color 0.15s ease, background-color 0.15s ease",
                        "&:hover": { borderColor: BRAND.link },
                        "&:focus-visible": { outline: `2px solid ${BRAND.link}`, outlineOffset: 2 },
                    }}
                >
                    <input {...getInputProps({ accept: ".tsv" })} />
                    {file ? (
                        <>
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 32, color: BRAND.link }} />
                            <Stack direction="row" alignItems="center" gap={0.5}>
                                <Typography fontWeight={600}>{file.name.slice(0, MAX_FILE_NAME)}</Typography>
                                <IconButton
                                    size="small"
                                    aria-label="Remove file"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        reset();
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                            <Typography variant="body2" color="text.secondary">
                                {(file.size / 1_000_000).toFixed(1)} MB · <InlineLink onClick={open}>choose another</InlineLink>
                            </Typography>
                        </>
                    ) : (
                        <>
                            <FileUploadOutlinedIcon sx={{ fontSize: 34, color: "text.secondary" }} />
                            <Typography fontWeight={600} fontSize={17}>
                                {isDragActive ? "Drop it here" : "Drop a .tsv file here"}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                or <InlineLink onClick={open}>browse</InlineLink>, or{" "}
                                <InlineLink onClick={() => reset("text")}>paste rows</InlineLink>
                            </Typography>
                        </>
                    )}
                </Box>
            )}
            {format}
            {error && (
                <Alert variant="outlined" severity="error" sx={{ whiteSpace: "pre-line" }}>
                    {error}
                </Alert>
            )}
            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                loading={loading}
                disabled={!canSubmit}
                sx={{ py: 1.5, fontSize: 16 }}
            >
                Rank variants
            </Button>
            {footer}
        </Stack>
    );
}
