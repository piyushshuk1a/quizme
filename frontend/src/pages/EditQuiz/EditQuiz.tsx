import { CircularProgress } from '@mui/material';
import { generatePath, useParams } from 'react-router';

import { DataNotAvailable, Error, ScreenCenter } from '@/components';
import { API_ENDPOINTS } from '@/constants';
import type { QuizDataWithCorrectOptions } from '@/containers';
import { useFetch, useUserInfo } from '@/hooks';

import CreateQuizWithProvider from '../CreateQuiz';

export const EditQuiz = () => {
  const { id: userId } = useUserInfo();
  const { id } = useParams() as { id: string };
  // Background revalidation must not remount the editor (it would discard
  // unsaved edits), so only the initial load shows the spinner and the
  // automatic refetch triggers are disabled.
  const { isLoading, data, error } = useFetch<
    QuizDataWithCorrectOptions,
    { includeCorrectOptions: boolean }
  >({
    path: generatePath(API_ENDPOINTS.getQuiz, { id }),
    params: { includeCorrectOptions: true },
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (error) {
    return (
      <Error
        message={typeof error === 'string' ? error : 'Something went wrong'}
      />
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
    return <DataNotAvailable message="Quiz not found" />;
  }

  if (data.publishedBy !== userId) {
    return <Error message="Only the owner can edit this quiz." />;
  }

  return <CreateQuizWithProvider quizData={data} />;
};
