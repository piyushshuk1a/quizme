import type { CustomColor, TypographyConstantsType } from './theme.types';

export const NAVY_BLUE: CustomColor = {
  100: '#FFFFFF',
  200: '#B3B3B3',
  300: '#747285',
  400: '#4A4C61',
  500: '#5E5F75',
  600: '#454455',
  700: '#343342',
  800: '#1A1C2D',
  900: '#000000',
};

export const ORANGE: Pick<CustomColor, 400 | 500 | 600> = {
  400: '#F8B48F',
  500: '#F16A20',
  600: '#854324',
};

export const RED: Pick<CustomColor, 400 | 500 | 600> = {
  400: '#D74A4A',
  500: '#B83030',
  600: '#901717',
};

export const GREEN: Pick<CustomColor, 500 | 600> = {
  500: '#278C5C',
  600: '#157647',
};

export const GRAYSCALE: Pick<CustomColor, 100 | 200 | 900> = {
  100: '#F5F5F5',
  200: '#C2C1C8',
  900: '#000000',
};

export const NAVBAR_BG_COLOR = '#1F2937';

/**
 * Custom theme colors
 */
export const THEME_COLORS = {
  primary: {
    main: '#7C3AED',
    light: '#8B5CF6',
    dark: '#8B5CF6',
    contrastText: GRAYSCALE[100],
  },
  secondary: {
    main: '#1E293B',
    light: '#334155',
    dark: '#334155',
    contrastText: GRAYSCALE[100],
  },
  neutral: {
    dark: GRAYSCALE[900],
    main: GRAYSCALE[100],
    light: GRAYSCALE[200],
    contrastText: NAVY_BLUE[800],
  },
  text: {
    primary: GRAYSCALE[100],
    secondary: GRAYSCALE[200],
    disabled: NAVY_BLUE[300],
  },
  background: {
    default: '#111827',
  },
  error: {
    light: RED[400],
    main: RED[500],
    dark: RED[600],
  },
  success: {
    main: GREEN[500],
    dark: GREEN[600],
  },
  warning: {
    main: ORANGE[500],
    dark: ORANGE[600],
  },
  info: {
    main: NAVY_BLUE[500],
    dark: NAVY_BLUE[600],
  },
} as const;

/**
 * Add custom font style definitions here
 *
 * @note to add custom font size object firstly you need to add the key to
 * CustomFontSizeType in src/theme/theme.types.ts
 */
export const TYPOGRAPHY_CONSTANTS: TypographyConstantsType = {
  fontStyle: {
    baseFontSize: {
      /**
       * This font-size is also used for converting the pixel units to rem in the app
       * Changing it will also affect the font-size and spacing in the app
       */
      fontSize: 16,
      lineHeight: 24,
    },
    title: {
      fontSize: 32,
      lineHeight: 38,
    },
    subtitle: {
      fontSize: 12,
      lineHeight: 16,
    },
    body1: {
      fontSize: 14,
      lineHeight: 18,
    },
    body2: {
      fontSize: 16,
      lineHeight: 22,
    },
  },

  /**
   * Add custom font weight definitions here
   */
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 450,
    semiBold: 600,
    bold: 700,
  },
} as const;
