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
import { useCallback, useEffect, useRef, useState } from 'react';
import { generatePath, useParams } from 'react-router';

import { Container } from '@/components';
import { API_ENDPOINTS } from '@/constants';
import InvitationsDialog from '@/containers/Quiz/InvitationsDialog';
import { useRenderQuiz } from '@/context';
import { useFetch, useMutation } from '@/hooks';

import { AttemptQuiz } from './AttemptQuiz';
import { CreatedBy } from './CreatedBy';
import { QuizDetails } from './QuizDetails';
import { QuizReviewDialog } from './QuizReviewDialog';

import type { QuizAttempt, QuizProps } from './Quiz.types';

export const TakeQuiz = ({ isOwner }: Omit<QuizProps, 'isCompleted'>) => {
  const { id } = useParams() as { id: string };
  const { quizInfo, userAnswers, questions } = useRenderQuiz();
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [openInvitationsModal, setOpenInvitationsModal] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { trigger: startQuiz, isMutating: isStartingQuiz } = useMutation<
    Record<string, string>,
    void,
    { status: string; startedAt: string }
  >({
    path: generatePath(API_ENDPOINTS.startQuiz, { id }),
    onSuccess: (data) => {
      setStartedAt(data.startedAt);
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
      setStartedAt(null);
      refetchAttempt();
    },
    onError: () => {
      enqueueSnackbar('Oops! Something went wrong. Please try again', {
        variant: 'error',
      });
    },
  });
  const handleSubmit = useCallback(() => {
    if (isSubmittingQuiz) return;
    const answers = Object.entries(userAnswers).map(([index, selected]) => ({
      order: questions[Number(index)].order,
      selectedOptions: selected,
    }));
    submitQuiz({ data: answers });
  }, [isSubmittingQuiz, userAnswers, questions, submitQuiz]);
  const submitRef = useRef(handleSubmit);
  useEffect(() => {
    submitRef.current = handleSubmit;
  }, [handleSubmit]);

  useEffect(() => {
    if (!startedAt) return;
    const deadline =
      new Date(startedAt).getTime() + quizInfo.durationMinutes * 60000;
    let submitted = false;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemainingTime(
        `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`,
      );
      if (seconds === 0 && !submitted) {
        submitted = true;
        submitRef.current();
      }
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startedAt, quizInfo.durationMinutes]);

  const handleStartQuiz = () => {
    if (!isStartingQuiz) startQuiz({});
  };

  // Invitations modal open/close handlers
  const handleOpenInvitations = () => setOpenInvitationsModal(true);
  const handleCloseInvitations = () => setOpenInvitationsModal(false);

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
                    sx={{ mr: 1 }}
                  />
                ) : (
                  <PlayArrow />
                )
              }
              disabled={isStartingQuiz || isFetchingAttempt}
              onClick={handleStartQuiz}
              size="medium"
              sx={{ minHeight: 40, px: 3 }}
            >
              Start Quiz
            </Button>
          )}

          {isOwner && (
            // Preview and Invite buttons for quiz owner
            <Box display="flex" alignItems="center" sx={{ gap: '12px' }}>
              {/* Preview button */}
              <Button
                color="primary"
                variant="contained"
                startIcon={<Visibility />}
                onClick={() => setPreviewOpen(true)}
                size="large"
                sx={{ minHeight: 48, px: 4 }}
              >
                Preview Quiz
              </Button>

              {/* Invite button */}
              <Button
                color="primary"
                variant="contained"
                size="large"
                onClick={handleOpenInvitations}
                sx={{
                  minHeight: 48,
                  px: 4,
                }}
              >
                Invite
              </Button>
            </Box>
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

      {/* attempt quiz modal */}
      <AttemptQuiz
        remainingTime={remainingTime}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmittingQuiz}
      />

      <QuizReviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* Invitations modal  */}
      <InvitationsDialog
        open={openInvitationsModal}
        onClose={handleCloseInvitations}
        quizId={id}
      />
    </Box>
  );
};

export default TakeQuiz;
