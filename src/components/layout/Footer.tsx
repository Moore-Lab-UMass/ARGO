"use client";
import { Typography, Box, Link as MuiLink, Stack, Grid } from "@mui/material";
import Image from "next/image";
import { LinkComponent } from "./LinkComponent";

export default function Footer() {
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
            ],
        },
    ];

    return (
        <Box
            id="Footer"
            component="footer"
            sx={{
                width: "100%",
                backgroundColor: "primary.main",
                zIndex: (theme) => theme.zIndex.appBar,
                color: "#fff",
                paddingX: 6,
            }}
        >
            <Grid container spacing={6} my={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1} alignItems="flex-start">
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Image src={"/argoOnDark.png"} alt="Logo" width={38} height={45} />
                            <Typography variant="h5" color="white">ARGO</Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ textAlign: "left" }}>
                            Aggregate Rank Generator
                        </Typography>
                        <Typography variant="body2">
                            Copyright ©{" "}
                            <MuiLink color="inherit" href="https://sites.google.com/view/moore-lab/">
                                Moore Lab
                            </MuiLink>{" "}
                            {new Date().getFullYear()}.
                        </Typography>
                    </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Grid container spacing={4}>
                        {sections.map((section) => (
                            <Grid size={{ xs: 6, sm: 3 }} key={section.title}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                                    {section.title}
                                </Typography>
                                <Stack spacing={0.5}>
                                    {section.links.map((link) => (
                                        <LinkComponent
                                            href={link.href}
                                            key={link.name}
                                            underline="none"
                                            color="inherit"
                                            width={"fit-content"}
                                            variant="subtitle2"
                                        >
                                            {link.name}
                                        </LinkComponent>
                                    ))}
                                </Stack>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}
