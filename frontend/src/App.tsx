import { Auth0Provider } from '@auth0/auth0-react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { BrowserRouter } from 'react-router';

import { useSignupRole, type UserRoles } from '@/hooks';
import { THEME } from '@/theme';

import { AppRoutes } from './routes';

export const App = () => {
  const { updateRole } = useSignupRole();

  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
        }}
        onRedirectCallback={(appState) => {
          if (appState?.role) {
            updateRole(appState.role as UserRoles);
          }
        }}
      >
        <ThemeProvider theme={THEME}>
          <CssBaseline />
          <AppRoutes />
        </ThemeProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
};
