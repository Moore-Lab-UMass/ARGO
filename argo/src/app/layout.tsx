import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from "./_utility/apolloprovider";
import { CssBaseline, ThemeProvider } from "@mui/material"
import theme from "./theme"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'

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
              {children}
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
