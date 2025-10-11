import { useAuth0 } from '@auth0/auth0-react';
import { Box, CircularProgress } from '@mui/material';
import { type PropsWithChildren } from 'react';

import { useUserInfo } from '@/hooks';

export const GuardedRoute = ({ children }: PropsWithChildren) => {
  const { loginWithRedirect, isLoading } = useAuth0();
  const { isAuthenticated } = useUserInfo();

  if (isLoading)
    return (
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        sx={{ width: '100%', height: 'calc(100vh - 72px)' }}
      >
        <CircularProgress />
      </Box>
    );

  if (!isAuthenticated) {
    loginWithRedirect();
  }

  return <>{children}</>;
};
