import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ApolloWrapper } from "@/components/providers/ApolloProvider";
import { CssBaseline, Stack, ThemeProvider } from "@mui/material"
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        {/* Sets the light/dark class on <html> before first paint, so there's no flash of the wrong theme */}
        <InitColorSchemeScript attribute="class" defaultMode="system" />
        <ApolloWrapper> {/* Wrapper for Apollo Requests, exposes client to child components */}
          <AppRouterCacheProvider> {/* Wrapper for MUIxNextjs integration, see https://mui.com/material-ui/integrations/nextjs/ */}
            <ThemeProvider theme={theme} defaultMode="system"> {/* Exposes theme to children; follows the system setting until the user picks a mode */}
              <CssBaseline /> {/* See https://mui.com/material-ui/react-css-baseline/ */}
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
