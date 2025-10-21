//Home Page
"use client";
import { Box, Stack, Typography } from "@mui/material";
import React from "react";
import ArgoUpload from "./components/tempArgoUpload";

export default function Home() {
  return (
      <Box
        width="100%"
        height="100%"
        paddingY={20}
        sx={{
          background: `
            linear-gradient(rgba(12, 24, 74, .75), rgba(12, 24, 74, .5)),
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
      <ArgoUpload />
      </Box>
  );
}