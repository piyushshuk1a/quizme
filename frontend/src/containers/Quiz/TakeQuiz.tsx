import { PlayArrow, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  type CircularProgressProps,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useEffect, useRef, useState } from 'react';
import { generatePath, useParams } from 'react-router';

import { Container } from '@/components';
import { API_ENDPOINTS } from '@/constants';
import { useRenderQuiz } from '@/context';
import { useFetch, useMutation } from '@/hooks';
import { Timer } from '@/utils';

import { AttemptQuiz } from './AttemptQuiz';
import { CreatedBy } from './CreatedBy';
import { QuizDetails } from './QuizDetails';

import type { QuizAttempt, QuizProps } from './Quiz.types';

export const TakeQuiz = ({ isOwner }: Omit<QuizProps, 'isCompleted'>) => {
  const { id } = useParams() as { id: string };
  const { quizInfo, userAnswers, questions } = useRenderQuiz();
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { trigger: startQuiz, isMutating: isStartingQuiz } = useMutation<
    Record<string, string>
  >({
    path: generatePath(API_ENDPOINTS.startQuiz, { id }),
    onSuccess: () => {
      setIsQuizOpen(true);
    },
    onError: () => {
      enqueueSnackbar(
        'Oops! Something went wrong. Please try again after refreshing.',
        { variant: 'error' },
      );
    },
  });
  const { mutate: refetchAttempt, isValidating: isFetchingAttempt } =
    useFetch<QuizAttempt>({
      path: generatePath(API_ENDPOINTS.quizAttempt, { id }),
    });
  const { trigger: submitQuiz, isMutating: isSubmittingQuiz } = useMutation<{
    data: Record<string, string[] | number>[];
  }>({
    path: generatePath(API_ENDPOINTS.submitQuiz, { id }),
    onSuccess: () => {
      enqueueSnackbar('Quiz submitted successfully!', {
        variant: 'success',
      });
      setIsQuizOpen(false);
      refetchAttempt();
    },
    onError: () => {
      enqueueSnackbar('Oops! Something went wrong. Please try again', {
        variant: 'error',
      });
    },
  });
  const timerRef = useRef<undefined | NodeJS.Timeout>(undefined);
  const [remainingTime, setRemainingTime] = useState('');

  const quizTimer = new Timer(
    quizInfo.durationMinutes * 60 * 1000,
    handleSubmit,
  );

  const handleStartQuiz = () => {
    startQuiz({});
    quizTimer.start();
    timerRef.current = setInterval(() => {
      setRemainingTime(quizTimer.getFormattedRemainingTime());
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  function handleSubmit() {
    const answers = Object.entries(userAnswers).map(([index, selected]) => {
      const order = questions[Number(index)].order;
      return { order, selectedOptions: selected };
    });
    submitQuiz({ data: answers });
  }

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Container component={Stack} gap={20} width="100%">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={20}
        >
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700 }}>
            {quizInfo.title}
          </Typography>
          {!isOwner && (
            <Button
              color="primary"
              variant="contained"
              startIcon={
                isStartingQuiz || isFetchingAttempt ? (
                  <CircularProgress
                    color={'white' as CircularProgressProps['color']}
                    size={16}
                    sx={{ mr: 4 }}
                  />
                ) : (
                  <PlayArrow />
                )
              }
              onClick={handleStartQuiz}
            >
              Start Quiz
            </Button>
          )}
          {isOwner && (
            <Button
              color="primary"
              variant="contained"
              startIcon={<Visibility />}
            >
              Preview Quiz
            </Button>
          )}
        </Box>
        <Box display="flex" justifyContent="space-between" gap={20}>
          <Stack width="80%" gap={20}>
            <QuizDetails />
          </Stack>
          <Stack minWidth={300} width="20%" gap={20}>
            <CreatedBy />
          </Stack>
        </Box>
      </Container>
      <AttemptQuiz
        remainingTime={remainingTime}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmittingQuiz}
      />
    </Box>
  );
};
