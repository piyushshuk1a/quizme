import { useAuth0 } from '@auth0/auth0-react';
import { Box, Link } from '@mui/material';

import { CALLBACK_URL } from '@/constants';
import { NAVBAR_BG_COLOR } from '@/theme';
import { pxToRem, setRedirectTo } from '@/utils';

import { Button } from '../Button';
import { Container } from '../Container';
import { LogoLink } from '../LogoLink';

export const Navbar = () => {
  const { loginWithRedirect, isAuthenticated, logout } = useAuth0();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        height: '72px',
        padding: '0 24px',
        background: NAVBAR_BG_COLOR,
        boxShadow: '0 0 8px black',
        position: 'fixed',
        width: '100vw',
        top: 0,
        left: 0,
        zIndex: 100,
      }}
    >
      <Container
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <LogoLink />
        <Box display="flex" gap={42} position="relative" right={32}>
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
            to="/quiz"
          >
            Explore Quizzes
          </Link>
        </Box>

        {!isAuthenticated && (
          <Button
            color="gradient"
            onClick={() => (
              setRedirectTo(),
              loginWithRedirect({
                authorizationParams: { redirect_uri: CALLBACK_URL },
              })
            )}
          >
            Log In
          </Button>
        )}
        {isAuthenticated && (
          <Box display="flex" gap={12}>
            <Button color="secondary" onClick={() => logout()}>
              Log Out
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};
