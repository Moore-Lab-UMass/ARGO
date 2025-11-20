import React, { useCallback, useState } from "react";
import { Grow, Box, Typography, Stack, Button } from "@mui/material";
import { useGrowOnScroll } from "../_utility/useGrowOnScroll";
import Grid from "@mui/material/Grid2"
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { parseDataInput } from "../_utility/uploadHelpers";
import { InputRegions } from "../types";
import { encodeRegions } from "../_utility/coding";
import DescriptionIcon from '@mui/icons-material/Description';

const examples = [
  { name: "Example 1", file: "/ArgoExample.tsv" },
  { name: "Example 2", file: "/ArgoExample2.tsv" },
  { name: "Example 3", file: "/ArgoExample3.tsv" },
];

const ExampleFiles: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);

  const { visible: examplesVisible, refs: examplesRefs } = useGrowOnScroll(examples.length);

  const configureInputedRegions = useCallback(async (data, fileName: string) => {
          const regions: InputRegions = data.map((item, index) => ({
              chr: item[0],
              start: Number(item[1]),
              end: Number(item[2]),
              ref: item[3],
              alt: item[4],
              strand: item[5],
              regionID: item.length === 7 ? item[6].replace("\r", "") : index + 1,
          }));
  
          setLoading(true);
  
          // Sort the regions
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
      }, [])

  const submitUploadedFile = useCallback((file: File) => {
          setLoading(true)
          let allLines = []
          if (file.type !== "tsv" && file.name.split('.').pop() !== "tsv") {
              console.error("File type is not tsv");
              setLoading(false)
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

  const handleUseExample = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const file = new File([blob], url.replaceAll("/", ""), { type: blob.type });
            submitUploadedFile(file)
        } catch (error) {
            console.error("Failed to fetch and set the file:", error);
        }
    };

  return (
    <Grid container spacing={5} justifyContent="flex-start" marginTop={6} width={"100%"}>
      {examples.map((file, index) => (
        <Grow
          in={examplesVisible[index]}
          timeout={800 + index * 300}
          key={`${file.name}-${index}`}
        >
          <Grid
            ref={(el) => {
              examplesRefs.current[index] = el;
            }}
            data-index={index}
            size={{ xs: 12, md: 4 }}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderRadius: 3,
                background:
                  `linear-gradient(135deg, #0c184a 0%, #152460ff 25%, #1e2f74ff 100%)`,
                color: "white",
                height: 200,
                p: 3,
                boxShadow: 3,
                textDecoration: "none",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                transformOrigin: "center",
                "&:hover": {
                  transform: "scale(1.02)",
                  boxShadow: 6,
                  zIndex: 2,
                },
              }}
            >
              <Stack direction={"row"} spacing={1} alignItems={"center"}>
              <DescriptionIcon />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {file.name}
              </Typography>
              </Stack>
              <Stack direction={"row"} justifyContent={"space-between"} width={"100%"}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  startIcon={<FileDownloadIcon />}
                  onClick={() => {
                    const url = file.file;
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = url.replaceAll("/", "");
                    link.click();
                  }}
                >
                  Download File
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                  endIcon={<FileUploadIcon />}
                  loading={loading}
                  onClick={() => handleUseExample(file.file)}
                >
                  Use File
                </Button>
                
              </Stack>
            </Box>
          </Grid>
        </Grow>
      ))}
    </Grid>
  );
};

export default ExampleFiles;
