import { Box, type BoxProps } from '@mui/material';

import { MAX_HORIZONTAL_WIDTH } from '@/constants';

export const Container = ({ children, ...rest }: BoxProps) => (
  <Box {...rest} maxWidth={MAX_HORIZONTAL_WIDTH}>
    {children}
  </Box>
);
