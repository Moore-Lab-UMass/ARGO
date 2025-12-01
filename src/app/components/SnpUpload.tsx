import React, { useCallback, useEffect, useState } from "react"
import { Button, Typography, Stack, IconButton, FormControl, Box, TextField, Alert, Container, RadioGroup, FormControlLabel, Radio, Tooltip, } from "@mui/material"
import { useDropzone } from "react-dropzone"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { InputRegions, ReturnedSnps } from "../types";
import { useLazyQuery } from "@apollo/client";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { SNP_QUERY } from "../queries";
import { encodeRegions } from "../_utility/coding";

const ArgoUpload: React.FC = ({
}) => {
    const [files, setFiles] = useState<File>(null)
    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles[0]);
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([false, ""]); // status, message
    const [filesSubmitted, setFilesSubmitted] = useState(false);
    const [textValue, setTextValue] = useState(""); // State to control the TextField value
    const [textChanged, setTextChanged] = useState(true);
    const [getSnps] = useLazyQuery(SNP_QUERY);
    const [selectedSearch, setSelectedSearch] = useState<string>("TSV File")

    //check to see if the value in the text box has changed
    useEffect(() => {
        setTextChanged(true)
    }, [textValue])

    const handleReset = (searchChange: string) => {
        setTextValue(""); // Clear the text box
        setFiles(null); //clear uploaded files
        setSelectedSearch(searchChange); //change search to selected search
        setError([false, ""]); // clear the error message
        setFilesSubmitted(false); //clear submitted files
        setTextChanged(true); //text has changed
    };

    //Allow the user to insert a tab in the text box
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            const target = event.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;

            // Insert tab character at the cursor position
            target.value =
                target.value.substring(0, start) +
                '\t' +
                target.value.substring(end);

            // Move the cursor after the inserted tab character
            target.selectionStart = target.selectionEnd = start + 1;
        }
    };

    //coppied from BedUpload
    function parseDataInput(data) {
        const allLines = []
        data.split("\n").forEach((line) => {
            if (!(line.startsWith("#") ||
                line.startsWith("browser") ||
                line.startsWith("track") ||
                line.length === 0
            )) {
                allLines.push(line)
            }
        })
        return allLines
    }

    const validateVariants = useCallback(async (data: string[]): Promise<ReturnedSnps | string> => {
        const trimmed = data.map((line) => line.trim());

        const response = await getSnps({
            variables: {
                snp: trimmed,
            },
            fetchPolicy: "cache-first",
        });

        const returnedSnps = response?.data?.getSNPAllele ?? [];
        const foundSet = new Set(
            returnedSnps.map((s: { snp: string }) => s.snp)
        );

        // Check each input
        for (const id of trimmed) {
            if (!foundSet.has(id)) {
                return `${id} is not a valid snp id`;
            }
        }

        return returnedSnps;

    }, [getSnps]);

    const configureInputedRegions = useCallback(async (data, fileName: string) => {

        setLoading(true);

        // Validate variants
        const variants = await validateVariants(data);
        if (typeof variants === "string") {
            setError([true, variants]);
            setLoading(false);
            return;
        }

        const regions: InputRegions = variants.map((variant) => ({
            chr: variant.chrom,
            start: variant.start,
            end: variant.start === variant.stop ? variant.start + 1 : variant.stop,
            ref: variant.refallele,
            alt: variant.altallele,
            strand: "+",
            regionID: variant.snp,
        }));

        // // Sort the regions
        const sortedRegions = regions.sort((a, b) => {
            const chrA = Number(a.chr.replace('chr', ''));
            const chrB = Number(b.chr.replace('chr', ''));

            if (chrA !== chrB) {
                return chrA - chrB;
            }
            return a.start - b.start;
        });
        const encoded = encodeRegions(sortedRegions);
        sessionStorage.setItem("encodedRegions", encoded);
        sessionStorage.setItem("fileName", fileName);
        window.open(`/${fileName}`, "_self")

        setLoading(false);
        setFilesSubmitted(true);
        setTextChanged(false);
    }, [validateVariants])


    function submitTextUpload(event) {
        setLoading(true)
        setError([false, ""])
        const uploadedData = event.get("textUploadFile").toString()
        const inputData = parseDataInput(uploadedData)
        configureInputedRegions(inputData, "TextSubmission")
    }

    const submitUploadedFile = useCallback((file: File) => {
        setLoading(true)
        setError([false, ""])
        let allLines = []
        if (file.type !== "tsv" && file.name.split('.').pop() !== "tsv") {
            console.error("File type is not tsv");
            setLoading(false)
            setFiles(null)
            setError([true, "File type is not tsv"])
            return
        }
        const reader = new FileReader()
        reader.onload = (r) => {
            const contents = r.target.result
            const lines = contents.toString()
            allLines = parseDataInput(lines)
        }
        reader.onabort = () => console.log("file reading was aborted")
        reader.onerror = () => console.log("file reading has failed")
        reader.onloadend = () => {
            configureInputedRegions(allLines, file.name.split('.')[0])
        }
        reader.readAsText(file)
    }, [configureInputedRegions])

    //coppied from BedUpload
    function truncateFileName(string, maxLength, ellipsis = "") {
        if (string.length <= maxLength) {
            return string;
        }

        return string.substring(0, maxLength - ellipsis.length) + ellipsis;
    }

    return (
        <Box
            width={"100%"}
        >
            {error[0] && (
                <Alert variant="outlined" severity="error" sx={{ width: "100%", mt: 2 }}>
                    {error[1]}
                </Alert>
            )}
            {/* Upload section */}
            <Stack width="100%">
                <Stack direction="row" alignItems="flex-start" flexWrap="wrap" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack alignItems="center" spacing={2}>
                        <FormControl>
                            <RadioGroup
                                row
                                value={selectedSearch}
                                onChange={(event) => handleReset(event.target.value)}
                            >
                                <FormControlLabel value="TSV File" control={<Radio />} label="TSV File" />
                                <FormControlLabel value="Text Box" control={<Radio />} label="Text Box" />
                            </RadioGroup>
                        </FormControl>
                        {/* Help icon to open Required Fields */}
                    </Stack>
                    <Tooltip title="Upload or type in RSID's and ARGO will autofill the required fields to be ready to rank! Please seperate ID's with a new line." arrow>
                        <IconButton>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
                <Box
                    sx={{
                        ...(files === null && {
                            flexGrow: 1,
                            display: "flex"
                        })
                    }}
                >
                    {selectedSearch === "TSV File" ? (
                        files === null && (
                            <Container
                                sx={{
                                    border: isDragActive ? "2px dashed blue" : "2px dashed grey",
                                    borderRadius: "10px",
                                    minWidth: "250px",
                                    pl: "0 !important",
                                    pr: "0 !important",
                                    color: isDragActive ? "text.secondary" : "text.primary",
                                    height: "215.5px"
                                }}
                            >
                                <div {...getRootProps()} style={{ padding: "1rem" }}>
                                    <input {...getInputProps()} type="file" accept=".tsv" />
                                    <Stack spacing={1} direction="column" alignItems="center">
                                        <UploadFileIcon />
                                        <Typography>Drag and drop a .tsv file</Typography>
                                        <Typography>or</Typography>
                                        <Button
                                            variant="outlined"
                                            disabled={isDragActive}
                                            sx={{ textTransform: "none" }}
                                        >
                                            Click to select a file
                                        </Button>
                                    </Stack>
                                </div>
                            </Container>
                        )
                    ) : (
                        <FormControl fullWidth>
                            <form action={submitTextUpload}>
                                <TextField
                                    name="textUploadFile"
                                    multiline
                                    fullWidth
                                    rows={6}
                                    placeholder="Copy and paste your data from Excel here"
                                    onKeyDown={handleKeyDown}
                                    value={textValue}
                                    onChange={(e) => setTextValue(e.target.value)}
                                />
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1 }}>
                                    <Button
                                        color="error"
                                        type="button"
                                        size="medium"
                                        variant="outlined"
                                        onClick={() => handleReset(selectedSearch)}
                                        sx={{ textTransform: "none" }}
                                    >
                                        Reset
                                    </Button>
                                    <LoadingButton
                                        loading={loading}
                                        loadingPosition="end"
                                        type="submit"
                                        size="medium"
                                        variant="outlined"
                                        disabled={!textChanged}
                                        sx={{ textTransform: "none" }}
                                    >
                                        Submit
                                    </LoadingButton>
                                </Stack>
                            </form>
                        </FormControl>
                    )}

                    {/* Uploaded file display */}
                    {files !== null && (
                        <>
                            <Typography mb={1} variant="h5">
                                Uploaded:
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Typography>
                                    {`${truncateFileName(files.name, 40)}\u00A0-\u00A0${(
                                        files.size / 1000000
                                    ).toFixed(1)}\u00A0mb`}
                                </Typography>
                                <IconButton color="primary" onClick={() => handleReset(selectedSearch)}>
                                    <Cancel />
                                </IconButton>
                            </Stack>
                            <LoadingButton
                                loading={loading}
                                loadingPosition="end"
                                sx={{ textTransform: "none", maxWidth: "18rem" }}
                                onClick={() => {
                                    submitUploadedFile(files);
                                }}
                                variant="outlined"
                                color="primary"
                                disabled={filesSubmitted}
                            >
                                <span>Submit</span>
                            </LoadingButton>
                        </>
                    )}
                </Box>
            </Stack>
        </Box>
    );
}

export default ArgoUpload;