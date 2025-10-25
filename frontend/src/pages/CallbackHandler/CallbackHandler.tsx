import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ScreenCenter } from '@/components';
import { REDIRECT_TO_SESSION_KEY } from '@/constants';

export const CallbackHandler = () => {
  const navigate = useNavigate();
  const { handleRedirectCallback } = useAuth0();

  const redirectTo =
    sessionStorage.getItem(REDIRECT_TO_SESSION_KEY) ??
    import.meta.env.VITE_APP_BASE_URL;

  useEffect(() => {
    let timer: NodeJS.Timeout;

    (async () => {
      try {
        await handleRedirectCallback();
      } finally {
        timer = setTimeout(() => {
          navigate(redirectTo);
        }, 1000);
      }
    })();

    return () => clearTimeout(timer);
  }, [redirectTo, navigate, handleRedirectCallback]);

  return (
    <ScreenCenter>
      <CircularProgress />
    </ScreenCenter>
  );
};
