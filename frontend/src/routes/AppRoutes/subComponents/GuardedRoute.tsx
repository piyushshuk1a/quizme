import { useAuth0 } from '@auth0/auth0-react';
import { type PropsWithChildren } from 'react';

import { useUserInfo } from '@/hooks';

export const GuardedRoute = ({ children }: PropsWithChildren) => {
  const { loginWithRedirect } = useAuth0();
  const { isAuthenticated } = useUserInfo();

  if (!isAuthenticated) {
    loginWithRedirect();
  }

  return <>{children}</>;
};
