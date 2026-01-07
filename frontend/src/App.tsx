import { Auth0Provider } from '@auth0/auth0-react';
import { Report } from '@mui/icons-material';
import { Box, CssBaseline, ThemeProvider, Typography } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter } from 'react-router';

import { useSignupRole, type UserRoles } from '@/hooks';
import { THEME } from '@/theme';

import { AppRoutes } from './routes';
import { pxToRem } from './utils';

export const App = () => {
  const { updateRole } = useSignupRole();
  console.log('debug: location', window.location.origin);

  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
        onRedirectCallback={(appState) => {
          if (appState?.role) {
            updateRole(appState.role as UserRoles);
          }
        }}
      >
        <SnackbarProvider
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          Components={{
            warning: (props) => (
              <Box
                {...props}
                display="flex"
                alignItems="center"
                padding={pxToRem(13, 20)}
                borderRadius={pxToRem(4)}
                gap={pxToRem(8)}
                sx={{ backgroundColor: '#DF6D14' }}
              >
                <Report sx={{ fontSize: 20 }} />
                <Typography
                  fontSize={pxToRem(14)}
                  sx={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {props.message}
                </Typography>
              </Box>
            ),
          }}
        >
          <ThemeProvider theme={THEME}>
            <CssBaseline />
            <AppRoutes />
          </ThemeProvider>
        </SnackbarProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
};
