import { alpha, type Components } from '@mui/material';

import { GRAYSCALE, THEME_COLORS } from '../theme.constants';

export const MuiButton: Components['MuiButton'] = {
  styleOverrides: {
    contained: {
      '&.MuiButton-containedPrimary': {
        border: `1px solid ${THEME_COLORS.primary.main}`,
      },
      '&.MuiButton-containedSecondary': {
        border: `1px solid ${alpha(GRAYSCALE[200], 0.4)}`,
      },
    },
  },
};
