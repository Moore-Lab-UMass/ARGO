import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "./_utility/apolloprovider";
import { CssBaseline, Stack, ThemeProvider } from "@mui/material"
import theme from "./theme"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import Header from "./components/tempHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ARGO",
  description: "Aggregate Rank Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ApolloWrapper> {/* Wrapper for Apollo Requests, exposes client to child components */}
          <AppRouterCacheProvider> {/* Wrapper for MUIxNextjs integration, see https://mui.com/material-ui/integrations/nextjs/ */}
            <CssBaseline /> {/* See https://mui.com/material-ui/react-css-baseline/ */}
            <ThemeProvider theme={theme}> {/* Exposes theme to children */}
              <Stack height={"100vh"} minHeight={0} id="app-wrapper">
                <Header maintenance={false} />
                <Stack flexGrow={1} overflow={"auto"} minHeight={0} id="content-wrapper">
                  <Stack flexGrow={1}>{children}</Stack>
                </Stack>
              </Stack>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
