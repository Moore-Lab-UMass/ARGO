//Home Page
"use client";
import { Box, Button, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import ArgoUpload from "./components/ArgoUpload";
import ExampleFiles from "./components/ExampleFiles";
import SnpUpload from "./components/SnpUpload";
import Grid from "@mui/material/Grid2"
import Link from "next/link";


export default function Home() {
  const [argoUploadVisible, setArgoUploadVisible] = useState(false);

  const toggleArgoUploadVisible = () => {
    setArgoUploadVisible(!argoUploadVisible);
  };

  return (
    <div>
      <Box
        width="100%"
        height={"auto"}
        paddingY={{ xs: 10, md: 20 }}
        sx={{
          background: `
            linear-gradient(#0c184abf, #0c184a80),
            url("/ArgoBackground2.png")
          `,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          backgroundAttachment: 'fixed'
        }}
      >
        <Stack direction={"row"} alignItems={"center"} spacing={4}>
          <Typography variant="h4"
            sx={{
              fontWeight: 400,
              fontSize: '40px',
              lineHeight: '40px',
              letterSpacing: 0,
              color: 'white',
              textAlign: 'center',
            }}
          >
            Aggregate Rank Generator
          </Typography>
        </Stack>
        <Box
          sx={{
            backgroundColor: "rgba(249, 248, 244, .8)",
            borderRadius: 2,
            px: 2,
            py: 2,
            display: "flex",
            width: { xs: "90%", sm: "80%", md: "60%", lg: "45%" },
            minWidth: { xs: "unset", md: 450 },
            mt: 2,
            alignItems: "center",
            flexDirection: "column",
            mx: "auto"
          }}
        >
          <Typography variant="h6">Upload Option</Typography>
          <RadioGroup
            row
            value={argoUploadVisible ? "argo" : "snp"}
            onChange={toggleArgoUploadVisible}
            sx={{ columnGap: 2 }}
          >
            <FormControlLabel
              value="snp"
              control={<Radio />}
              label="Common RSID List"
            />
            <FormControlLabel
              value="argo"
              control={<Radio />}
              label="Required Fields File"
            />
          </RadioGroup>
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
        sx={{ paddingY: 2, paddingX: { xs: 5, md: 20 } }}
      >
        <Typography
          sx={{
            fontWeight: 550,
            fontSize: "34px",
            textAlign: "center",
          }}
        >
          Example Files
        </Typography>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Try these example files to get started with ARGO. They have all required fields and are ready to be uploaded. Download these files to view what your file should look like
        </Typography>
        <ExampleFiles />
      </Box>
      <Box
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ paddingY: 10, paddingX: { xs: 5, md: 20 } }}
      >
        <Grid container width="100%" justifyContent="space-around">
          <Grid size={6} width={"auto"}>
            <Typography variant="h4" sx={{ fontWeight: 550, mb: 2 }}>
              Not Sure Where to Start?
            </Typography>
            <Typography variant="body1" maxWidth={500} mb={2}>
              Visit the help page to view a detailed breakdown of the application and how to contact our team
            </Typography>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/help"
              sx={{ backgroundColor: (theme) => theme.palette.primary.main }}
            >
              View Breakdown
            </Button>
          </Grid>
          <Grid size={6} width={"auto"}>
            <Typography variant="h4" sx={{ fontWeight: 550, mb: 2 }}>
              Want to Know More?
            </Typography>
            <Typography variant="body1" maxWidth={500} mb={2}>
              Visit our About page to learn what ARGO does
            </Typography>
            <Button
              variant="contained"
              LinkComponent={Link}
              href="/about"
              sx={{ backgroundColor: (theme) => theme.palette.primary.main }}
            >
              Learn More
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
}