import { CircularProgress } from '@mui/material';
import { generatePath, useParams } from 'react-router';

import { DataNotAvailable, Error, ScreenCenter } from '@/components';
import { API_ENDPOINTS, USER_ROLES } from '@/constants';
import {
  Quiz as QuizContainer,
  type QuizAttempt,
  type QuizData,
} from '@/containers';
import { RenderQuizProvider } from '@/context';
import { useFetch, useUserInfo } from '@/hooks';
export const Quiz = () => {
  const { id: userId, role } = useUserInfo();
  const { id } = useParams() as { id: string };
  const { isLoading, data, error } = useFetch<QuizData>({
    path: generatePath(API_ENDPOINTS.getQuiz, { id }),
  });
  const {
    isLoading: isLoadingQuizAttempt,
    data: quizAttemptData,
    error: errorQuizAttempt,
  } = useFetch<QuizAttempt>({
    path: generatePath(API_ENDPOINTS.quizAttempt, { id }),
  });
  console.log('data.publishedBy', data?.publishedBy, 'userId is', userId);
  const isOwner = data?.publishedBy === userId;
  const isAdmin = role === USER_ROLES.admin;

  if (error || errorQuizAttempt) {
    return <Error />;
  }

  if (isLoading || isLoadingQuizAttempt) {
    return (
      <ScreenCenter>
        <CircularProgress />
      </ScreenCenter>
    );
  }

  if (!data) {
    return <DataNotAvailable message="Quiz not found" />;
  }

  return (
    <RenderQuizProvider quizData={{ ...data, attempt: quizAttemptData }}>
      <QuizContainer isCompleted={false} isOwner={isOwner} isAdmin={isAdmin} />
    </RenderQuizProvider>
  );
};
