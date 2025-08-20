import { createTheme, type PaletteColor } from '@mui/material';

import { pxToRem } from '@/utils';

import { MuiButton, MuiLink } from './common';
import { THEME_COLORS } from './theme.constants';
import { TYPOGRAPHY } from './typography';

export const THEME = createTheme({
  palette: {
    mode: 'dark',
    ...THEME_COLORS,
    tonalOffset: 0.75,
  },
  spacing: pxToRem,
  typography: TYPOGRAPHY,
  components: { MuiLink, MuiButton },
});

declare module '@mui/material/styles' {
  /**
   * To add a custom color to the palette, add it to the Palette interface
   * and PaletteOptions
   */
  interface Palette {
    neutral: PaletteColor;
  }
  interface PaletteOptions {
    neutral: PaletteColor;
  }

  /**
   * Add custom typography variants
   */
  interface TypographyVariants {
    title: React.CSSProperties;
    subtitle: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    title: React.CSSProperties;
    subtitle: React.CSSProperties;
  }
}
