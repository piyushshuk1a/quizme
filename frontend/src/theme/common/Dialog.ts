import { alpha, type Components } from '@mui/material';

import { pxToRem } from '@/utils';

import { NAVY_BLUE } from '../theme.constants';

export const MuiDialog: Components['MuiDialog'] = {
  styleOverrides: {
    container: {
      background: alpha(NAVY_BLUE[600], 0.8),
    },
    paper: {
      background: NAVY_BLUE[800],
      padding: pxToRem(8, 0),
    },
  },
};

export const MuiDialogActions: Components['MuiDialogActions'] = {
  styleOverrides: {
    root: {
      padding: pxToRem(0, 24, 16, 24),
    },
  },
};
