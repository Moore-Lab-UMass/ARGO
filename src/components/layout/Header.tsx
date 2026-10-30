"use client";
import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LinkComponent } from "./LinkComponent";
import { BRAND } from "@/lib/colors";
import ThemeToggle from "./ThemeToggle";

/** Height of the header bar in px (the results page sizes its sticky filter sidebar from this). */
export const HEADER_HEIGHT = 64;

export type PageInfo = {
    pageName: string,
    link: string,
}

const pageLinks: PageInfo[] = [
    {
        pageName: "About",
        link: "/about",
    },
    {
        pageName: "Help",
        link: "/help",
    },
];

type ResponsiveAppBarProps = {
    maintenance?: boolean;
};

function Header({ maintenance }: ResponsiveAppBarProps) {

    return (
        <Box position={"sticky"} top={0} zIndex={1000}>
            <Stack
                direction={"row"}
                style={{
                    width: "100%",
                    height: "40px",
                    backgroundColor: "#ff9800",
                    color: "#fff",
                    textAlign: "center",
                    display: !maintenance && "none",
                }}
                justifyContent={"center"}
                alignItems={"center"}
                spacing={2}
            >
                <WarningAmberIcon />
                <Typography sx={{ fontWeight: "bold" }}>
                    Scheduled maintenance is in progress... Some features may be unavailable
                </Typography>
                <WarningAmberIcon />
            </Stack>
            <Box
                component="header"
                sx={{ backgroundColor: BRAND.cream, borderBottom: `1px solid ${BRAND.creamBorder}`, px: 3 }}
            >
                <Stack direction="row" alignItems="center" gap={2} minHeight={HEADER_HEIGHT}>
                    <Stack
                        direction="row"
                        gap={1.5}
                        alignItems="center"
                        component={Link}
                        href="/"
                        sx={{ textDecoration: "none", color: "text.primary" }}
                    >
                        {/* Both logos render; CSS shows the one for the current mode, so there's no flash */}
                        <Box height={40} width={36} position="relative" sx={(theme) => theme.applyStyles("dark", { display: "none" })}>
                            <Image priority src="/argoLogo.png" fill sizes="36px" alt="ARGO logo" style={{ objectFit: "contain" }} />
                        </Box>
                        <Box height={40} width={36} position="relative" sx={(theme) => ({ display: "none", ...theme.applyStyles("dark", { display: "block" }) })}>
                            <Image src="/argoOnDark.png" fill sizes="36px" alt="ARGO logo" style={{ objectFit: "contain" }} />
                        </Box>
                        <Typography sx={{ fontSize: 22, fontWeight: 600, letterSpacing: "0.02em" }}>ARGO</Typography>
                    </Stack>
                    <Box flexGrow={1} />
                    <Stack component="nav" aria-label="Main" direction="row" gap={0.5} alignItems="center">
                        {pageLinks.map((page) => (
                            <LinkComponent
                                key={page.pageName}
                                href={page.link}
                                underline="none"
                                sx={{
                                    color: "text.primary",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    px: 1.75,
                                    py: 1.25,
                                    borderRadius: "6px",
                                    "&:hover": { backgroundColor: "action.hover" },
                                }}
                            >
                                {page.pageName}
                            </LinkComponent>
                        ))}
                    </Stack>
                    <ThemeToggle />
                </Stack>
            </Box>
        </Box>
    );
};
export default Header;
