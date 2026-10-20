import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress } from '@mui/material';
import { useEffect, type PropsWithChildren } from 'react';

import { ScreenCenter } from '@/components';
import { CALLBACK_URL } from '@/constants';
import { setRedirectTo } from '@/utils';

export const GuardedRoute = ({ children }: PropsWithChildren) => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

  // Wait for Auth0 to restore the session before deciding to redirect,
  // otherwise refreshing a guarded page bounces an already signed-in user
  // back to the login screen.
  useEffect(() => {
    if (isLoading || isAuthenticated) return;
    setRedirectTo();
    loginWithRedirect({ authorizationParams: { redirect_uri: CALLBACK_URL } });
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (!isAuthenticated) {
    return (
      <ScreenCenter>
        <CircularProgress />
      </ScreenCenter>
    );
  }

  return <>{children}</>;
};
