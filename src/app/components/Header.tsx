"use client";
import * as React from "react";
import {
    AppBar,
    Box,
    Toolbar,
    Stack,
    Typography,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LinkComponent } from "./LinkComponent";

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
        link: "/abhelpout",
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
            <AppBar position="static">
                <Toolbar sx={{ justifyContent: "space-between", backgroundColor: "rgba(249, 248, 244, 1)" }}>
                    <Stack direction={"row"} spacing={2} alignItems={"center"}>
                        <Box component={Link} href={"/"} height={45} width={45} position={"relative"}>
                            <Image
                                priority
                                src="/argo_logo.png"
                                fill
                                alt="ARGO logo"
                                style={{ objectFit: "contain", objectPosition: "left center" }}
                            />
                        </Box>
                        <Typography variant="h5" mb={3} color="black">
                            ARGO
                        </Typography>
                    </Stack>
                    <Stack spacing={3} direction={"row"} display={{ xs: "none", md: "flex" }} alignItems={"center"}>
                        {pageLinks.map((page) => (
                            <Box
                                key={page.pageName}
                                display={"flex"}
                                alignItems={"center"}
                                id="LinkBox"
                                sx={{ mr: 2 }}
                            >
                                <LinkComponent id="Link" display={"flex"} color={"black"} href={page.link} underline="none">
                                    {page.pageName}
                                </LinkComponent>
                            </Box>
                        ))}
                    </Stack>
                </Toolbar>
            </AppBar>
        </Box>
    );
};
export default Header;