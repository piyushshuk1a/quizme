import { useAuth0 } from '@auth0/auth0-react';
import { Stack, Typography, type BoxProps } from '@mui/material';

import { CALLBACK_URL } from '@/constants';
import { setRedirectTo } from '@/utils';

import { Button } from '../Button';
import { ScreenCenter } from '../ScreenCenter';

import type { ReactNode } from 'react';

export const LoginError = ({
  imgHeight = 300,
  message,
  ...rest
}: BoxProps & {
  imgHeight?: number;
  message?: ReactNode;
}) => {
  const { loginWithRedirect } = useAuth0();

  return (
    <ScreenCenter {...rest}>
      <Stack gap={32} alignItems="center">
        <img height={imgHeight} src="/login-error.svg" />
        <Typography component="h1" variant="h6">
          {message ?? (
            <Stack alignItems="center" gap={16}>
              <Typography component="h1" variant="h6">
                Please login to view your quizzes.
              </Typography>
              <Button
                size="large"
                onClick={() => (
                  setRedirectTo(),
                  loginWithRedirect({
                    authorizationParams: { redirect_uri: CALLBACK_URL },
                  })
                )}
              >
                Login to QuizMaster
              </Button>
            </Stack>
          )}
        </Typography>
      </Stack>
    </ScreenCenter>
  );
};
