import React, { useState } from "react";
import { Grow, Box, Typography, Stack, Button, Grid } from "@mui/material";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DescriptionIcon from '@mui/icons-material/Description';
import { useGrowOnScroll } from "@/hooks/useGrowOnScroll";
import { useSubmitRegions } from "@/hooks/useSubmitRegions";
import { parseRegionsTsv } from "@/lib/regions/parse";

const examples = [
  { name: "Example 1", file: "/ArgoExample.tsv" },
  { name: "Example 2", file: "/ArgoExample2.tsv" },
  { name: "Example 3", file: "/ArgoExample3.tsv" },
];

/** Cards for the example files in /public: download one, or submit it directly. */
const ExampleFiles: React.FC = () => {
  const submitRegions = useSubmitRegions();
  const [loading, setLoading] = useState<boolean>(false);

  const { visible: examplesVisible, refs: examplesRefs } = useGrowOnScroll(examples.length);

  const handleUseExample = async (url: string) => {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const fileName = url.replaceAll("/", "").split(".")[0];
      submitRegions(parseRegionsTsv(await response.text()), fileName);
    } catch (error) {
      console.error("Failed to load example file:", error);
      setLoading(false);
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
            size={{ md: 12, lg: 4 }}
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
                height: 150,
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
                  Download
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    borderColor: "white",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "1rem",
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "#515bb7"
                  }}
                  endIcon={<ArrowForwardIosIcon />}
                  loading={loading}
                  onClick={() => handleUseExample(file.file)}
                >
                  Test
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
