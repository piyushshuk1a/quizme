import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { generatePath, useParams } from 'react-router';

import { API_ENDPOINTS } from '@/constants';
import { type QuizData } from '@/containers';
import { RenderQuizProvider } from '@/context';
import { useFetch } from '@/hooks';

import type { PropsWithChildren } from 'react';

const ScreenCenter = ({ children }: PropsWithChildren) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="center"
    width="100%"
    height="calc(100vh - 72px)"
  >
    {children}
  </Box>
);

export const Quiz = () => {
  const { id } = useParams() as { id: string };
  const { isLoading, data, error } = useFetch<QuizData>({
    path: generatePath(API_ENDPOINTS.getQuiz, { id }),
  });

  if (error) {
    return (
      <ScreenCenter>
        <Stack gap={32} alignItems="center">
          <img height={300} src="/server-error.svg" />
          <Typography component="h1" variant="h6">
            Something went wrong
          </Typography>
        </Stack>
      </ScreenCenter>
    );
  }

  if (isLoading) {
    return (
      <ScreenCenter>
        <CircularProgress />
      </ScreenCenter>
    );
  }

  if (!data) {
    return (
      <ScreenCenter>
        <Stack gap={32} alignItems="center">
          <img height={300} src="/empty-state.svg" />
          <Typography component="h1" variant="h6">
            Quiz not found
          </Typography>
        </Stack>
      </ScreenCenter>
    );
  }

  return (
    <RenderQuizProvider
      quizData={{ ...data, duration: data.durationMinutes.toString() }}
    >
      <Quiz />
    </RenderQuizProvider>
  );
};
