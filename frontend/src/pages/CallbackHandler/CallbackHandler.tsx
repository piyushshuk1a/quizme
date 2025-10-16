import { CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { ScreenCenter } from '@/components';
import { REDIRECT_TO_SESSION_KEY } from '@/constants';

export const CallbackHandler = () => {
  const navigate = useNavigate();

  const redirectTo =
    sessionStorage.getItem(REDIRECT_TO_SESSION_KEY) ??
    import.meta.env.VITE_APP_BASE_URL;

  useEffect(() => {
    if (redirectTo) {
      navigate(redirectTo);
    }
  }, [redirectTo, navigate]);

  return (
    <ScreenCenter>
      <CircularProgress />;
    </ScreenCenter>
  );
};
