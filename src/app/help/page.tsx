"use client";
import { Box, Divider, Link, Typography } from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid2"
import Image from "next/image";
import homepage from "../../../public/help/homepage.png";
import requiredFields from "../../../public/help/requiredFields.png";
import ContactForm from "./contactForm";

export default function About() {
    return (
        <main>
            <Grid
                container
                spacing={3}
                sx={{ maxWidth: "min(70%, 1000px)", minWidth: "600px", marginX: "auto", marginY: "3rem" }}
            >
                {/* Header */}
                <Grid size={12}>
                    <Typography variant="h2">Don&apos;t know where to start?</Typography>
                    <Divider />
                    <Typography mt={1} variant="body1" paragraph>
                        If you are unsure how to use ARGO, you may begin with our example file which has 100 variants ready to go.
                        Just click &quot;Use Example File&quot; on the homepage and ARGO will automatically load it and rank the variants for you.
                    </Typography>
                </Grid>
                <Grid
                    size={12}
                    justifyContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                >
                    <Image src={homepage} alt={"example"} style={{ width: "80%", height: "100%" }} />
                </Grid>
                <Grid size={12}>
                    <Typography mt={1} variant="body1" paragraph>
                        You are also able to download the example file if you want to view the standard input format ARGO accepts.
                        The required fields are shown below, and will highlight red on the homepage if they are missing.
                    </Typography>
                </Grid>
                <Grid
                    size={12}
                    justifyContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                >
                    <Image src={requiredFields} alt={"Required Fields"} style={{ width: "80%", height: "100%" }} />
                </Grid>
                {/* Contact Us */}
                <Grid id="contact-us" size={12}>
                    <Typography mb={1} variant="h2">
                        Contact Us
                    </Typography>
                    <Typography mb={1} variant="body1">
                        Send us a message and we&apos;ll be in touch!
                    </Typography>
                    <Typography mb={1} variant="body1">
                        As this is a beta site, we would greatly appreciate any feedback you may have. Knowing how our users are
                        using the site and documenting issues they may have are important to make this resource better and easier
                        to use.
                    </Typography>
                    <Box mb={1}>
                        <Typography display={"inline"} variant="body1">
                            If you&apos;re experiencing an error/bug, feel free to&nbsp;
                        </Typography>
                        <Link
                            display={"inline"}
                            href="https://github.com/Moore-Lab-UMass/ARGO/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            submit an issue on Github.
                        </Link>
                    </Box>
                    <Box mb={2}>
                        <Typography display={"inline"} variant="body1">
                            If you would like to send an attachment, feel free to email us directly at&nbsp;
                        </Typography>
                        <Link
                            display={"inline"}
                            href="mailto:encode-screen@googlegroups.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            encode&#8209;screen@googlegroups.com
                        </Link>
                    </Box>
                    <ContactForm />
                </Grid>
            </Grid>
        </main>
    );
}
