'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { BRAND } from '@/lib/colors';

/** Inter and JetBrains Mono are loaded with next/font in layout.tsx */
export const SANS_FONT = 'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif';
export const MONO_FONT = 'var(--font-mono), "JetBrains Mono", ui-monospace, monospace';

/** Corner radius for cards and buttons, in px */
export const RADIUS = 10;

const shared: ThemeOptions = {
  typography: {
    fontFamily: SANS_FONT,
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: RADIUS },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
};

const theme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: {
      main: BRAND.navy,
      contrastText: "#FFFFFF",
      dark: "#16295c",
      light: BRAND.link,
    },
    secondary: {
      main: "#E7EEF8",
      dark: "#ecf0fa"
    },
    background: { default: BRAND.page, paper: "#ffffff" },
    text: { primary: BRAND.text, secondary: BRAND.muted },
  },
});

/** Dark theme for the navy filter sidebar, so MUI controls read correctly on navy. */
export const sidebarTheme = createTheme({
  ...shared,
  typography: { ...shared.typography, fontSize: 13 },
  palette: {
    mode: 'dark',
    primary: { main: "#8fb4ff", contrastText: BRAND.navy },
    background: { default: BRAND.navy, paper: BRAND.navy },
    text: { primary: "#ffffff", secondary: BRAND.onNavyMuted, disabled: "rgba(255,255,255,0.45)" },
    divider: "rgba(255,255,255,0.14)",
  },
  components: {
    ...shared.components,
    MuiCheckbox: { defaultProps: { size: "small" } },
    MuiRadio: { defaultProps: { size: "small" } },
  },
});

export default theme;
