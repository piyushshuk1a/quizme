import { THEME_COLORS } from '../theme.constants';

import { LinkBehavior } from './subComponents';

import type { Components } from '@mui/material';

export const MuiLink: Components['MuiLink'] = {
  defaultProps: {
    component: LinkBehavior,
  },
  styleOverrides: {
    root: {
      textDecoration: 'none',
      color: THEME_COLORS.text.primary,
      opacity: '.8',

      '&:hover': {
        opacity: 1,
      },
    },
  },
};
