import { Facebook, Instagram, X } from '@mui/icons-material';
import { Box, Link, Typography } from '@mui/material';

import { pxToRem } from '@/utils';

import { Container } from '../Container';
import { LogoLink } from '../LogoLink';

export const Footer = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      component="footer"
    >
      <Container width="100%">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
          padding={pxToRem(36, 0)}
          borderBottom="1px solid #2a2c2d"
        >
          <LogoLink />
          <Box display="flex" gap={12}>
            <Link to="https://x.com">
              <X sx={{ fontSize: 14 }} />
            </Link>
            <Link to="https://facebook.com">
              <Facebook sx={{ fontSize: 16 }} />
            </Link>
            <Link to="https://instagram.com">
              <Instagram sx={{ fontSize: 16 }} />
            </Link>
          </Box>
        </Box>
        <Box padding={24} textAlign="center">
          <Typography color="textDisabled">
            &copy; {new Date().getFullYear()} QuizMaster. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
