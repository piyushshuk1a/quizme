import { Box, Link } from '@mui/material';

import { NAVBAR_BG_COLOR } from '@/theme';
import { pxToRem } from '@/utils';

import { Button } from '../Button';
import { Container } from '../Container';
import { LogoLink } from '../LogoLink';

export const Navbar = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      sx={{
        height: '72px',
        padding: '0 24px',
        background: NAVBAR_BG_COLOR,
        position: 'fixed',
        width: '100vw',
        top: 0,
        left: 0,
      }}
    >
      <Container
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <LogoLink />
        <Box display="flex" gap={42}>
          <Link
            sx={{ fontSize: pxToRem(16), opacity: 0.7, fontWeight: 600 }}
            to="#features"
          >
            Features
          </Link>
          <Link
            sx={{ fontSize: pxToRem(16), opacity: 0.7, fontWeight: 600 }}
            to="/pricing"
          >
            Pricing
          </Link>
          <Link
            sx={{ fontSize: pxToRem(16), opacity: 0.7, fontWeight: 600 }}
            to="/pricing"
          >
            About
          </Link>
        </Box>

        <Box display="flex" gap={12}>
          <Button color="secondary">Log In</Button>
          <Button color="gradient">Sign Up</Button>
        </Box>
      </Container>
    </Box>
  );
};
