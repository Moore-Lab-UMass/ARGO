"use client";
import { Divider, Typography, Link } from "@mui/material";
import React from "react";
import Grid from "@mui/material/Grid2"
import Image from "next/image";
import encodeEncyclopedia from "../../../public/about/encodeencyclopedia.png";
import Argo from "../../../public/Argo.png";

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
                    <Typography variant="h2">About ARGO</Typography>
                    <Divider />
                    <Typography mt={1} variant="body1" paragraph>
                        ARGO (Aggregate Rank Generator) is a web-based transcriptional regulation resources to aid in the
                        prioritization and interpretation of non-coding disease variants. While many Mendelian diseases are caused
                        by defects in the coding or splicing regions of genes, a precise molecular diagnosis has not been identified
                        for the majority of patients with suspected Mendelian conditions. It is therefore likely that the disease-associated
                        mutations for some of these patients lie in non-coding, regulatory regions of the genome and we need methods for
                        interpreting their functional consequences.
                    </Typography>
                </Grid>
                {/* ENCODE Encyclopedia */}
                <Grid container size={12} height={300}>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 5,
                        }}
                    >
                        <Typography variant="h5" gutterBottom>The ENCODE Encyclopedia</Typography>
                        <Typography variant="body1" paragraph>
                            The ENCODE Encyclopedia encompasses a comprehensive set of sequence (yellow), element (red), gene (green)
                            and interaction (blue) annotations (<b>Figure&nbsp;1</b>). These annotations can either derive directly
                            from primary data (primary level) or derive from the integration of multiple data types using innovative
                            computational methods (integrative level).{" "}
                        </Typography>
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 7,
                        }}
                    >
                        <Image src={encodeEncyclopedia} alt={"Encode Encyclopedia"} style={{ width: "100%", height: "100%" }} />
                    </Grid>
                </Grid>
                {/* Sister Sites */}
                <Grid container size={12}>
                    <Grid size={12}>
                        <Typography variant="h5" gutterBottom>Sister Sites</Typography>
                        <Typography variant="body1" paragraph>
                            We previously developed a suite of resources for integrating and interpreting regulatory non-coding genomic regions.
                            We led the development of the{" "}
                            <Link href="https://www.encodeproject.org/" target="_blank" rel="noopener">
                                ENCODE Registry of candidate cis-Regulatory Elements (cCREs)
                            </Link>
                            , a collection of candidate non-coding
                            regulatory regions across the human and mouse genomes. The Registry contains 2.3 million cCREs in humans and spans thousands of tissues,
                            cell types, and cellular states, comprising promoter, enhancer, silencer, and CTCF-bound elements. To search and visualize these
                            elements, we developed the web portal{" "}
                            <Link href="https://screen.wenglab.org/" target="_blank" rel="noopener">
                                SCREEN
                            </Link>
                            . SCREEN enables users to search for regions, genes, or variants of interest and returns
                            sets of cCREs that can be filtered or visualized based on their predictive functions, activity patterns, and overlap with other genomic
                            annotations (e.g. transcription factor binding sites).  In addition to cCRE-centric tools, we have also developed{" "}
                            <Link href="https://www.factorbook.org/" target="_blank" rel="noopener">
                                Factorbook2
                            </Link>
                            , a web portal
                            that hosts expression data, binding motifs, and binding sites for over 800 transcription factors. These resources provide an integrated platform
                            for researchers to access and interpret data concerning non-coding regulatory regions.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            ARGO&apos;s purpose is to expand and adapt these tools to develop a comprehensive resource for annotating and prioritizing non-coding variants.
                            We developed a novel variant prioritization scheme which ranks variants based on their overlap with non-coding annotations.
                        </Typography>
                    </Grid>
                </Grid>
                {/* Rank Aggregation */}
                <Grid container size={12} height={400}>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 7,
                        }}
                        justifyContent={"center"}
                        alignItems={"center"}
                        display={"flex"}
                    >
                        <Image src={Argo} alt={"Argo"} style={{ width: "auto", height: "100%" }} />
                    </Grid>
                    <Grid
                        size={{
                            xs: 12,
                            lg: 5,
                        }}
                    >
                        <Typography variant="h5" gutterBottom>Rangk Aggregation</Typography>
                        <Typography variant="body1" paragraph>
                            ARGO implements rank aggregation methods, which produce a single consensus ranking by combining multiple different rankings, 
                            often deriving from complementary sources. Rank aggregation is advantageous because it can leverage the strengths of individual methods, 
                            while mitigating their weaknesses, leading to more robust, reliable, and useful outcomes. Rank aggregation also enables us to integrate 
                            diverse data sources with different scales or normalizations as highlighted by our previous work using rank aggregation to predict functionally 
                            active enhancers in embryonic mouse tissues
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container size={12}>
                    <Grid size={12}>
                        <Typography variant="h5" gutterBottom>Annotations</Typography>
                        <Typography variant="h6">Sequence</Typography>
                        <Typography variant="body1" paragraph>
                            ARGO prioritizes candidate variants by aggregating ranks across three categories of annotations: (1) sequence, (2) elements, and (3) genes 
                            For sequence features, variants are ranked based on their predicted impact on transcription factor binding and their evolutionary conservation. 
                            Using our Factorbook motif annotations, we calculate the change in motif score between the reference and input variant. To reduce potential 
                            false positive motif sites, users are also able to filter motif matches based on support from transcription factor ChIP-seq data. 
                            Evolutionary conservation can indicate that a genomic sequence has a crucial biological function and variants in highly conserved regions are more likely 
                            to be pathogenic. Because different types of Mendelian conditions may alter regulatory pathways with varying levels of conservation, users can select from 
                            conservation scores calculated across vertebrate, mammalian, or primate lineages.
                        </Typography>
                        <Typography variant="h6">Elements</Typography>
                        <Typography variant="body1" paragraph>
                            ARGO also prioritizes variants using element-level annotations by intersecting variants with cCREs. Users have the option to rank elements 
                            by their cell type activity and can either broadly group samples by organ or tissue—such as heart, brain, or liver—or select specific cell types such 
                            as cardiomyocytes, neurons, or hepatocytes. Users are also able to rank cCREs by the specificity of their activity. This is useful as some conditions
                            may affect multiple systems, suggesting that they disrupt regulatory processes in many different cell types. In contrast, other conditions may be highly 
                            specific to a particular cell type, and therefore it is important to prioritize variants that are only active in those cell types
                        </Typography>
                        <Typography variant="h6">Genes</Typography>
                        <Typography variant="body1" paragraph>
                            Finally, ARGO evaluates variants based on properties of their associated genes. To assign variants to target genes, users are able to choose a 
                            linking method such as 3D chromatin contacts, computational predictions (ABC4 and ENCODE rE2G5) or linear distance. Then, similar to the cCRE selection, 
                            users will then select tissue or cell types of interest for ranking genes by expression as well as denote whether they should include information about 
                            the specificity of cell type expression.
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </main>
    );
}
