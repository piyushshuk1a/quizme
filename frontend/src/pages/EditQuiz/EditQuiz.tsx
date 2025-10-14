import { CircularProgress } from '@mui/material';
import { generatePath, useParams } from 'react-router';

import { DataNotAvailable, Error, ScreenCenter } from '@/components';
import { API_ENDPOINTS } from '@/constants';
import type { QuizDataWithCorrectOptions } from '@/containers';
import { useFetch } from '@/hooks';

import CreateQuizWithProvider from '../CreateQuiz';

export const EditQuiz = () => {
  const { id } = useParams() as { id: string };
  const { isLoading, data, error, isValidating } = useFetch<
    QuizDataWithCorrectOptions,
    { includeCorrectOptions: boolean }
  >({
    path: generatePath(API_ENDPOINTS.getQuiz, { id }),
    params: { includeCorrectOptions: true },
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
  });

  if (error) {
    return (
      <Error
        message={typeof error === 'string' ? error : 'Something went wrong'}
      />
    );
  }

  if (isLoading || isValidating) {
    return (
      <ScreenCenter>
        <CircularProgress />
      </ScreenCenter>
    );
  }

  if (!data) {
    return <DataNotAvailable message="Quiz not found" />;
  }

  return <CreateQuizWithProvider quizData={data} />;
};
