"use client";
import { Box, Divider, Link, Typography } from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid2"
import Image from "next/image";
import exampleCards from "../../../public/help/exampleCards.png";
import requiredFields from "../../../public/help/requiredFields.png";
import snpUpload from "../../../public/help/snpUpload.png";
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
                        If you are unsure how to use ARGO, you may begin with one of our example files, which have 100 variants each all ready to rank.
                        Just click &quot;Use File&quot; on the card and ARGO will automatically load it and rank the variants for you.
                    </Typography>
                </Grid>
                <Grid
                    size={12}
                    justifyContent={"center"}
                    alignItems={"center"}
                    display={"flex"}
                >
                    <Image src={exampleCards} alt={"example"} style={{ width: "80%", height: "100%" }} />
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
                <Grid size={12}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                    <Typography mt={1} variant="body1" paragraph>
                        You don&apos;t need a full ARGO safe file, however. Feel free to use our RSID upload option and simply supply us with a list of
                        common RSID&apos;s, and then we&apos;ll do the rest! Just make sure that your home screen upload section says &quot;Common RSID List&quot; before you begin.
                        We will autofill the rest of the required fields for you based on the ID&apos;s you provide and automatically rank them.
                    </Typography>
                    <Image src={snpUpload} alt={"Required Fields"} style={{ width: "80%", height: "80%" }} />
                </Grid>
                <Grid size={12}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}>
                    <Typography mt={1} variant="body1" paragraph>
                        Once uploaded, you can view your aggregate ranked regions in the first table. Every subsequent table is Sequence, Elements, and Genes
                        specific. Their respected filters will manipulate these tables and their contents if changed, which will then affect the aggregate 
                        ranks in the main table. Select your desired filters and explore the results!
                    </Typography>
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
