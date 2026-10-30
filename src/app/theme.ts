'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles';
import { BRAND, DARK, LIGHT, SurfaceTokens } from '@/lib/colors';

declare module '@mui/material/styles' {
  interface Palette {
    surface: SurfaceTokens;
  }
  interface PaletteOptions {
    surface?: SurfaceTokens;
  }
}

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

/**
 * Site theme with light and dark color schemes. MUI writes both as CSS variables and switches them
 * with a `light`/`dark` class on <html> (set before paint by InitColorSchemeScript in layout.tsx).
 */
const theme = createTheme({
  ...shared,
  cssVariables: { colorSchemeSelector: 'class' },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: BRAND.navy,
          contrastText: "#FFFFFF",
          dark: "#16295c",
          light: LIGHT.link,
        },
        secondary: {
          main: "#E7EEF8",
          dark: "#ecf0fa"
        },
        background: { default: LIGHT.page, paper: LIGHT.paper },
        text: { primary: LIGHT.text, secondary: LIGHT.muted },
        divider: LIGHT.border,
        surface: LIGHT,
      },
    },
    dark: {
      palette: {
        primary: {
          main: DARK.link,
          contrastText: "#0d1a3a",
          dark: "#6f9cf5",
          light: "#b3ccff",
        },
        secondary: {
          main: DARK.selectedRow,
          dark: "#182238",
        },
        background: { default: DARK.page, paper: DARK.paper },
        text: { primary: DARK.text, secondary: DARK.muted },
        divider: DARK.border,
        surface: DARK,
      },
    },
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
