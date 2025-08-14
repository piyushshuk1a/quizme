import { Box } from '@mui/material';

import { pxToRem } from '@/utils';

import type { AppLogoProps } from './AppLogo.types';

export const AppLogo = ({ size = 40 }: AppLogoProps) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    borderRadius="30%"
    sx={{
      width: pxToRem(size),
      height: pxToRem(size),
      background:
        'linear-gradient(to right, rgb(139, 92, 246), rgb(59, 130, 246))',
    }}
  >
    <img width={size / 2} height={size / 2} src="/appIcon.svg" alt="App Icon" />
  </Box>
);
