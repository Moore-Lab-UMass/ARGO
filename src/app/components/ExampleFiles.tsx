import React from "react";
import { Grow, Box, Typography, Stack, Button } from "@mui/material";
import { useGrowOnScroll } from "../_utility/useGrowOnScroll";
import Grid from "@mui/material/Grid2"
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';

const examples = [
  { name: "Example 1", file: "/ArgoExample.tsv" },
  { name: "Example 2", file: "/ArgoExample.tsv" },
  { name: "Example 3", file: "/ArgoExample.tsv" },
];

const ExampleFiles: React.FC = () => {

  const { visible: examplesVisible, refs: examplesRefs } = useGrowOnScroll(examples.length);

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
