import { CircularProgress } from '@mui/material';
import { generatePath, useParams } from 'react-router';

import { DataNotAvailable, Error, ScreenCenter } from '@/components';
import { API_ENDPOINTS, USER_ROLES } from '@/constants';
import { Quiz as QuizContainer, type QuizData } from '@/containers';
import { RenderQuizProvider } from '@/context';
import { useFetch, useUserInfo } from '@/hooks';
export const Quiz = () => {
  const { id: userId, role } = useUserInfo();
  const { id } = useParams() as { id: string };
  const { isLoading, data, error } = useFetch<QuizData>({
    path: generatePath(API_ENDPOINTS.getQuiz, { id }),
  });
  const isOwner = data?.publishedBy === userId;
  const isAdmin = role === USER_ROLES.admin;

  if (error) {
    return <Error />;
  }

  if (isLoading) {
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
    <RenderQuizProvider quizData={{ ...data }}>
      <QuizContainer isCompleted={true} isOwner={isOwner} isAdmin={isAdmin} />
    </RenderQuizProvider>
  );
};
