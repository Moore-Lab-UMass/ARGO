//Home Page
"use client";
import { Box, Collapse, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import ArgoUpload from "./components/ArgoUpload";
import ExampleFiles from "./components/ExampleFiles";
import SnpUpload from "./components/SnpUpload";

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
            url("/ArgoBackground.png")
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
            Aggreagate Rank Generator
          </Typography>
        </Stack>
        <Collapse in={!argoUploadVisible} sx={{ width: "100%" }} timeout={500}>
          <SnpUpload />
          <Box
            sx={{
              width: { xs: "90%", sm: "80%", md: "60%", lg: "45%" },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              mx: "auto",
            }}
          >
            {!argoUploadVisible && (
              <Typography variant="subtitle2" color="#b2bcf0" textAlign={{ xs: "center", md: "right" }}>
                Have a complete file with all required fields?{" "}
                <span
                  onClick={toggleArgoUploadVisible}
                  style={{ color: "#b2bcf0", textDecoration: "underline", cursor: "pointer" }}
                >
                  Click here!
                </span>
              </Typography>
            )}
          </Box>
        </Collapse>

        <Collapse in={argoUploadVisible} sx={{ width: "100%" }} timeout={500}>
          <ArgoUpload />
          <Box
            sx={{
              width: { xs: "90%", sm: "80%", md: "60%", lg: "45%" },
              display: "flex",
              justifyContent: { xs: "center", md: "flex-end" },
              mx: "auto",
            }}
          >
            {argoUploadVisible && (
              <Typography variant="subtitle2" color="#b2bcf0" textAlign={{ xs: "center", md: "right" }}>
                Only have RSID&apos;s and want to autofill the rest?{" "}
                <span
                  onClick={toggleArgoUploadVisible}
                  style={{ color: "#b2bcf0", textDecoration: "underline", cursor: "pointer" }}
                >
                  Click here!
                </span>
              </Typography>
            )}
          </Box>
        </Collapse>
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
    </div>
  );
}