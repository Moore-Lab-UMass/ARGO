"use client";
import { Typography, Box, Link as MuiLink, Stack } from "@mui/material";
import Image from "next/image";
import { LinkComponent } from "./LinkComponent";
import { BRAND } from "@/lib/colors";

const sections = [
    {
        title: "About us",
        links: [
            { name: "ARGO", href: "/about" },
            { name: "Weng Lab", href: "https://www.umassmed.edu/zlab/" },
            { name: "Moore Lab", href: "https://sites.google.com/view/moore-lab/" },
            { name: "ENCODE Consortium", href: "https://www.encodeproject.org/" },
            { name: "UMass Chan Medical School", href: "https://www.umassmed.edu/" },
        ],
    },
    {
        title: "Sister Sites",
        links: [
            { name: "SCREEN", href: "https://screen.wenglab.org/" },
            { name: "PsychSCREEN", href: "https://psychscreen.wenglab.org/psychscreen" },
            { name: "igSCREEN", href: "https://igscreen.vercel.app/" },
            { name: "Factorbook", href: "https://www.factorbook.org/" },
        ],
    },
    {
        title: "Help",
        links: [
            { name: "Contact Us/Feedback", href: "/help#contact-us" },
            { name: "Report an issue", href: "https://github.com/Moore-Lab-UMass/ARGO/issues" },
        ],
    },
];

const sidePadding = { xs: 3, md: 6 };

export default function Footer() {
    return (
        <Box
            id="Footer"
            component="footer"
            sx={{
                width: "100%",
                backgroundColor: "primary.main",
                zIndex: (theme) => theme.zIndex.appBar,
                color: "#fff",
            }}
        >
            <Stack direction={{ xs: "column", md: "row" }} gap={5} sx={{ px: sidePadding, pt: 4, pb: 3 }}>
                <Stack flex="1 1 260px" gap={1} alignItems="flex-start">
                    <Stack direction="row" gap={1.25} alignItems="center">
                        <Image src="/argoOnDark.png" alt="ARGO logo" width={32} height={38} />
                        <Typography sx={{ fontSize: 20, fontWeight: 600, letterSpacing: "0.02em" }}>ARGO</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 14, color: "#dfe6f6" }}>Aggregate Rank Generator</Typography>
                </Stack>
                <Box
                    flex="2 1 520px"
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))"
                    gap={3.5}
                >
                    {sections.map((section) => (
                        <Box key={section.title}>
                            <Typography
                                component="h2"
                                sx={{
                                    mb: 1.25,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.08em",
                                    color: BRAND.onNavyMuted,
                                }}
                            >
                                {section.title}
                            </Typography>
                            <Stack gap={0.75}>
                                {section.links.map((link) => (
                                    <LinkComponent
                                        href={link.href}
                                        key={link.name}
                                        underline="hover"
                                        color="inherit"
                                        width="fit-content"
                                        sx={{ fontSize: 14 }}
                                    >
                                        {link.name}
                                    </LinkComponent>
                                ))}
                            </Stack>
                        </Box>
                    ))}
                </Box>
            </Stack>
            <Box
                sx={{
                    px: sidePadding,
                    py: 1.75,
                    borderTop: "1px solid rgba(255,255,255,0.12)",
                    fontSize: 13,
                    color: BRAND.onNavyMuted,
                }}
            >
                Copyright ©{" "}
                <MuiLink color="#ffffff" href="https://sites.google.com/view/moore-lab/">
                    Moore Lab
                </MuiLink>{" "}
                {new Date().getFullYear()}.
            </Box>
        </Box>
    );
}
