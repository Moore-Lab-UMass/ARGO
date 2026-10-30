"use client";
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useState } from "react";
import ArgoUpload from "@/components/landing/ArgoUpload";
// import ExampleFiles from "@/components/landing/ExampleFiles";
import SnpUpload from "@/components/landing/SnpUpload";
import Link from "next/link";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { BRAND, CATEGORY_COLORS } from "@/lib/colors";

type UploadMethod = "argo" | "snp";

//Home page
export default function Home() {
  const [method, setMethod] = useState<UploadMethod>("argo");

  return (
    <div>
      <Box
        sx={{
          background: `url("/bg.png")`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          py: { xs: 6, md: 12 },
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" },
            gap: { xs: 5, md: 8 },
            alignItems: "center",
          }}
        >
          <Box sx={{ color: "white" }}>
            <Box
              component="span"
              sx={{
                display: "inline-block",
                px: 1.75,
                py: 0.75,
                mb: 3,
                borderRadius: 999,
                fontSize: 15,
                fontWeight: 600,
                backgroundColor: "rgba(255, 255, 255, 0.14)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
              }}
            >
              Aggregate Rank Generator
            </Box>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: 38, sm: 48, lg: 60 },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: "-0.035em",
                mb: 3,
              }}
            >
              Rank genomic variants by the evidence behind them.
            </Typography>
            <Typography sx={{ fontSize: { xs: 17, md: 20 }, lineHeight: 1.6, color: "rgba(255, 255, 255, 0.82)", maxWidth: 560, mb: 3 }}>
              ARGO combines conservation and motif changes, overlapping cCREs, and linked genes into one aggregate rank. Tune each
              category and see your variants re-rank instantly.
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={3}>
              {Object.values(CATEGORY_COLORS).map(({ label, onNavy }) => (
                <Stack key={label} direction="row" alignItems="center" gap={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "3px", backgroundColor: onNavy }} />
                  <Typography sx={{ fontSize: 17, color: "rgba(255, 255, 255, 0.9)" }}>{label}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
          <Box
            sx={{
              backgroundColor: "background.paper",
              borderRadius: 4,
              p: { xs: 2.5, sm: 4 },
              boxShadow: "0 24px 60px rgba(8, 18, 48, 0.35)",
            }}
          >
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={method}
              aria-label="Upload method"
              onChange={(_, next: UploadMethod | null) => next && setMethod(next)}
              sx={{
                mb: 3,
                p: "4px",
                gap: "4px",
                borderRadius: 3,
                backgroundColor: BRAND.track,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: "10px !important",
                  m: "0 !important",
                  py: 1.25,
                  fontSize: 16,
                  textTransform: "none",
                  color: "text.secondary",
                },
                "& .MuiToggleButton-root.Mui-selected, & .MuiToggleButton-root.Mui-selected:hover": {
                  backgroundColor: "background.paper",
                  color: "text.primary",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(16, 24, 40, 0.12)",
                },
              }}
            >
              <ToggleButton value="argo">ARGO file</ToggleButton>
              <ToggleButton value="snp">rsID list</ToggleButton>
            </ToggleButtonGroup>
            {method === "argo" ? <ArgoUpload /> : <SnpUpload />}
          </Box>
        </Box>
      </Box>
      {/* <Box
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
      </Box> */}
      <Box
        width={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
        sx={{ paddingY: 8, paddingX: { xs: 5, md: 20 } }}
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
        sx={{ paddingY: 8, paddingX: { xs: 5, md: 20 }, backgroundColor: "secondary.dark"}}
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