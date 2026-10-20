import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ScreenCenter } from '@/components';
import { REDIRECT_TO_SESSION_KEY, ROUTES } from '@/constants';

/**
 * Resolves the stored "return to" path so that we only ever navigate to a
 * route inside this application (never to an absolute URL or back to the
 * callback route itself).
 */
const getRedirectPath = () => {
  const stored = sessionStorage.getItem(REDIRECT_TO_SESSION_KEY);
  if (!stored || !stored.startsWith('/') || stored.startsWith('//')) {
    return ROUTES.home;
  }
  if (stored.startsWith(ROUTES.callback)) return ROUTES.home;
  return stored;
};

export const CallbackHandler = () => {
  const navigate = useNavigate();
  // Auth0Provider processes the `code` & `state` query params itself (and
  // applies the sign-up role from appState). Calling handleRedirectCallback
  // here as well consumes the same login transaction twice and produces
  // "Invalid state" errors, so we only wait for the provider to finish.
  const { isLoading, error } = useAuth0();

  useEffect(() => {
    if (isLoading) return;
    if (error) console.error('Login could not be completed:', error);

    const redirectTo = getRedirectPath();
    sessionStorage.removeItem(REDIRECT_TO_SESSION_KEY);
    navigate(redirectTo, { replace: true });
  }, [isLoading, error, navigate]);

  return (
    <ScreenCenter>
      <CircularProgress />
    </ScreenCenter>
  );
};
