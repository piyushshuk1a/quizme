import { useAuth0 } from '@auth0/auth0-react';
import { type PropsWithChildren } from 'react';

import { CALLBACK_URL } from '@/constants';
import { useUserInfo } from '@/hooks';
import { setRedirectTo } from '@/utils';

export const GuardedRoute = ({ children }: PropsWithChildren) => {
  const { loginWithRedirect } = useAuth0();
  const { isAuthenticated } = useUserInfo();

  if (!isAuthenticated) {
    setRedirectTo();
    loginWithRedirect({ authorizationParams: { redirect_uri: CALLBACK_URL } });
  }

  return <>{children}</>;
};
