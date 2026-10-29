import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ApolloWrapper } from "@/components/providers/ApolloProvider";
import { CssBaseline, Stack, ThemeProvider } from "@mui/material"
import theme from "./theme"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import Header from "@/components/layout/Header";
import MuiXLicense from "@/components/providers/MuiXLicense";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
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
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ApolloWrapper> {/* Wrapper for Apollo Requests, exposes client to child components */}
          <AppRouterCacheProvider> {/* Wrapper for MUIxNextjs integration, see https://mui.com/material-ui/integrations/nextjs/ */}
            <CssBaseline /> {/* See https://mui.com/material-ui/react-css-baseline/ */}
            <ThemeProvider theme={theme}> {/* Exposes theme to children */}
              <Stack height={"100vh"} minHeight={0} id="app-wrapper">
                <Header maintenance={false} />
                <Stack flexGrow={1} overflow={"auto"} minHeight={0} id="content-wrapper">
                  <Stack flexGrow={1}>{children}</Stack>
                  <Footer />
                </Stack>
              </Stack>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ApolloWrapper>
        <MuiXLicense />
      </body>
    </html>
  );
}
