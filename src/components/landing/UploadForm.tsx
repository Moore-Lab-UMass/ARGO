import { FormEvent, KeyboardEvent, ReactNode, useState } from "react";
import { Alert, Box, Button, Container, FormControl, FormControlLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material";
import { Cancel } from "@mui/icons-material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useDropzone } from "react-dropzone";

type Mode = "TSV File" | "Text Box";

type UploadFormProps = {
    /** Validates and submits the text; resolves to an error message, or null on success */
    onSubmit: (text: string, fileName: string) => Promise<string | null>;
    /** Name used for text box submissions */
    textSubmissionName: string;
    /** Icon button(s) shown next to the mode switch, e.g. help */
    helpButton: ReactNode;
    /** Called whenever the form is cleared */
    onReset?: () => void;
};

const MAX_FILE_NAME = 40;

/** Inserts a tab at the cursor instead of moving focus, so pasted spreadsheet rows can be edited. */
function insertTab(event: KeyboardEvent<HTMLDivElement>, text: string, setText: (t: string) => void) {
    if (event.key !== "Tab") return;
    event.preventDefault();
    const target = event.target as HTMLTextAreaElement;
    const start = target.selectionStart;
    setText(text.slice(0, start) + "\t" + text.slice(target.selectionEnd));
    requestAnimationFrame(() => (target.selectionStart = target.selectionEnd = start + 1));
}

/** Upload a .tsv file or paste text, then submit it. Shared by both upload methods on the home page. */
export default function UploadForm({ onSubmit, textSubmissionName, helpButton, onReset }: UploadFormProps) {
    const [mode, setMode] = useState<Mode>("TSV File");
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (files) => setFile(files[0]) });

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

    const submitFile = () => {
        if (!file) return;
        if (file.name.split(".").pop() !== "tsv") {
            setFile(null);
            setError("File type is not tsv");
            return;
        }
        submit(() => file.text(), file.name.split(".")[0]);
    };

    const submitText = (event: FormEvent) => {
        event.preventDefault();
        submit(async () => text, textSubmissionName);
    };

    return (
        <Box width="100%">
            {error && (
                <Alert variant="outlined" severity="error" sx={{ width: "100%", mt: 2, whiteSpace: "pre-line" }}>
                    {error}
                </Alert>
            )}
            <Stack width="100%">
                <Stack direction="row" alignItems="flex-start" flexWrap="wrap" justifyContent="space-between" sx={{ mb: 1 }}>
                    <FormControl>
                        <RadioGroup row value={mode} onChange={(e) => reset(e.target.value as Mode)}>
                            <FormControlLabel value="TSV File" control={<Radio />} label="TSV File" />
                            <FormControlLabel value="Text Box" control={<Radio />} label="Text Box" />
                        </RadioGroup>
                    </FormControl>
                    {helpButton}
                </Stack>
                <Box sx={file === null ? { flexGrow: 1, display: "flex" } : undefined}>
                    {mode === "Text Box" ? (
                        <FormControl fullWidth>
                            <form onSubmit={submitText}>
                                <TextField
                                    multiline
                                    fullWidth
                                    rows={6}
                                    placeholder="Copy and paste your data from Excel here"
                                    onKeyDown={(e) => insertTab(e, text, setText)}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                />
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Button color="error" type="button" variant="outlined" onClick={() => reset()}>
                                        Reset
                                    </Button>
                                    <Button loading={loading} loadingPosition="end" type="submit" variant="outlined">
                                        Submit
                                    </Button>
                                </Stack>
                            </form>
                        </FormControl>
                    ) : file === null ? (
                        <Container
                            sx={{
                                border: isDragActive ? "2px dashed blue" : "2px dashed grey",
                                borderRadius: "10px",
                                minWidth: "250px",
                                pl: "0 !important",
                                pr: "0 !important",
                                color: isDragActive ? "text.secondary" : "text.primary",
                                height: "215.5px",
                            }}
                        >
                            <div {...getRootProps()} style={{ padding: "1rem" }}>
                                <input {...getInputProps()} type="file" accept=".tsv" />
                                <Stack spacing={1} direction="column" alignItems="center">
                                    <UploadFileIcon />
                                    <Typography>Drag and drop a .tsv file</Typography>
                                    <Typography>or</Typography>
                                    <Button variant="outlined" disabled={isDragActive}>
                                        Click to select a file
                                    </Button>
                                </Stack>
                            </div>
                        </Container>
                    ) : (
                        <Box>
                            <Typography mb={1} variant="h5">
                                Uploaded:
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography>
                                    {`${file.name.slice(0, MAX_FILE_NAME)} - ${(file.size / 1_000_000).toFixed(1)} mb`}
                                </Typography>
                                <IconButton color="primary" onClick={() => reset()}>
                                    <Cancel />
                                </IconButton>
                            </Stack>
                            <Button loading={loading} loadingPosition="end" sx={{ maxWidth: "18rem" }} onClick={submitFile} variant="outlined">
                                Submit
                            </Button>
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}
