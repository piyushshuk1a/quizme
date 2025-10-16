import { useAuth0 } from '@auth0/auth0-react';
import { CircularProgress, Stack } from '@mui/material';
import { useEffect } from 'react';

import {
  DataNotAvailable,
  Error,
  LoginError,
  ScreenCenter,
} from '@/components';
import { API_ENDPOINTS } from '@/constants';
import { useFetch } from '@/hooks';

import { type QuizData } from '../Quiz';

import { QuizItem } from './QuizItem';

import type { ListQuizParams, ListQuizProps } from './ListQuiz.types';

export const ListQuiz = ({ myQuizzes = false, invited }: ListQuizProps) => {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth0();
  const {
    data,
    isLoading,
    error,
    isValidating,
    mutate: refetch,
  } = useFetch<QuizData[], ListQuizParams, string>({
    path: API_ENDPOINTS.listQuizzes,
    params: { invited, myQuizzes, email: user?.email },
  });

  useEffect(() => {
    refetch();
  }, [isAuthenticated, refetch]);

  if (
    isLoading ||
    (error === 'Unauthorized' &&
      (isAuthenticated || isAuthLoading) &&
      isValidating)
  )
    return (
      <ScreenCenter>
        <CircularProgress />
      </ScreenCenter>
    );

  if (error)
    return error === 'Unauthorized' ? (
      <LoginError height="calc(100vh - 200px)" />
    ) : (
      <Error height="calc(100vh - 200px)" />
    );

  if (!data || data.length == 0)
    return (
      <DataNotAvailable
        height={'calc(100vh - 200px)'}
        message="No Quizzes Found"
      />
    );

  return (
    <Stack mb={20} gap={40}>
      {data.map((quizData) => (
        <QuizItem
          key={quizData.id as string}
          {...quizData}
          isMyQuiz={myQuizzes}
        />
      ))}
    </Stack>
  );
};
