"use client";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import React, { useState } from "react";
import ArgoUpload from "./components/Landing/ArgoUpload";
import ExampleFiles from "./components/Landing/ExampleFiles";
import SnpUpload from "./components/Landing/SnpUpload";
import Link from "next/link";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

//Home page
export default function Home() {
  const [argoUploadVisible, setArgoUploadVisible] = useState(true);

  const toggleArgoUploadVisible = () => {
    setArgoUploadVisible(!argoUploadVisible);
  };

  return (
    <div>
      <Box
        width="100%"
        height="auto"
        paddingY={{ xs: 10, md: 15 }}
        sx={{
          background: `url("/bg.png")`,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <Typography variant="h3"
          sx={{
            color: 'white',
          }}
          mb={.5}
        >
          Aggregate Rank Generator
        </Typography>
        <Typography 
          variant="body2"
          sx={{
            color: 'white',
          }}
        >
          A variant prioritization resource
        </Typography>
        <Box
          sx={{
            backgroundColor: "rgba(249, 248, 244, .8)",
            borderRadius: 2,
            px: 2,
            py: 2,
            display: "flex",
            width: { xs: "90%", sm: "80%", md: "60%", lg: "50%" },
            minWidth: { xs: "unset", md: 450 },
            mt: 2,
            alignItems: "center",
            flexDirection: "column",
            mx: "auto"
          }}
        >
          <Box width="100%">
            <Typography variant="h6" sx={{ mb: 1 }}>
              Choose your upload method
            </Typography>
            <RadioGroup
              row
              value={argoUploadVisible ? "argo" : "snp"}
              onChange={toggleArgoUploadVisible}
              sx={{ gap: 2, width: "100%" }}
            >
              {[
                {
                  value: "argo",
                  title: "Required Fields File",
                  description:
                    "I have a TSV file or text data with all required ARGO fields (Chromosome, Position, Alleles, etc.)",
                },
                {
                  value: "snp",
                  title: "Common rsID List",
                  description:
                    "I have a list of SNP IDs and need the system to retrieve genomic coordinates automatically",
                },
              ].map((option) => {
                const selected =
                  (argoUploadVisible && option.value === "argo") ||
                  (!argoUploadVisible && option.value === "snp");

                return (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio sx={{ display: "none" }} />}
                    sx={{
                      flex: 1,
                      m: 0,
                    }}
                    label={
                      <Box
                        sx={{
                          width: "100%",
                          p: 2.5,
                          borderRadius: 2,
                          border: "2px solid",
                          borderColor: selected ? "primary.main" : "grey.300",
                          backgroundColor: selected ? "primary.main" : "grey.100",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: selected ? "primary.main" : "grey.600",
                          },
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: selected ? 600 : 500,
                            color: selected ? "white" : "text.secondary",
                          }}
                        >
                          {option.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            mt: 0.75,
                            color: selected ? "white" : "text.secondary",
                          }}
                        >
                          {option.description}
                        </Typography>
                      </Box>
                    }
                  />
                );
              })}
            </RadioGroup>
          </Box>
          {!argoUploadVisible ? (
            <SnpUpload />
          ) : (
            <ArgoUpload />
          )}
        </Box>
      </Box>
      <Box
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ paddingY: 2, paddingX: { xs: 5, md: 20 }, mb: 10 }}
      >
        <Typography
          sx={{
            fontWeight: 550,
            fontSize: "34px",
            textAlign: "center",
          }}
        >
          Try our example files
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Try these ready-to-use example files to get started.
          Download them to see the correct format or upload directly to test ARGO
        </Typography>
        <ExampleFiles />
      </Box>
      <Box
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ paddingY: 8, paddingX: { xs: 5, md: 20 }, backgroundColor: "secondary.dark" }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          New to ARGO?
        </Typography>
        <Typography variant="body1" maxWidth={500} mb={2} textAlign={"center"}>
          Visit the help page to view a detailed breakdown of the application and how to contact our team
        </Typography>
        <Button
          variant="contained"
          LinkComponent={Link}
          href="/help"
          sx={{ backgroundColor: (theme) => theme.palette.primary.main }}
          startIcon={<ArrowForwardIcon />}
        >
          View Help Guide
        </Button>
      </Box>
      <Box
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ paddingY: 8, paddingX: { xs: 5, md: 20 } }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Learn more about ARGO
        </Typography>
        <Typography variant="body1" maxWidth={500} mb={2} textAlign={"center"}>
          Visit our About page to learn what ARGO is and how it works.
        </Typography>
        <Button
          variant="outlined"
          LinkComponent={Link}
          href="/about"
          startIcon={<ArrowForwardIcon />}
        >
          About ARGO
        </Button>
      </Box>
    </div>
  );
}