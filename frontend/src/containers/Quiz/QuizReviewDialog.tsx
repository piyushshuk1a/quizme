import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { generatePath } from 'react-router';

import { API_ENDPOINTS } from '@/constants';
import { useRenderQuiz } from '@/context';
import { useFetch } from '@/hooks';

import type { QuizData } from './Quiz.types';

export const QuizReviewDialog = ({
  open,
  onClose,
  review = false,
}: {
  open: boolean;
  onClose: () => void;
  review?: boolean;
}) => {
  const { quizInfo, questions, attempt } = useRenderQuiz();
  const { data, error, isLoading } = useFetch<QuizData>({
    path:
      open && review && quizInfo.id
        ? generatePath(API_ENDPOINTS.getQuiz, { id: quizInfo.id })
        : null,
  });
  const displayedQuestions = review ? (data?.questions ?? []) : questions;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {review ? 'Review Answers' : 'Preview Quiz'} — {quizInfo.title}
      </DialogTitle>
      <DialogContent>
        <Stack gap={20}>
          {isLoading && <CircularProgress />}
          {error ? (
            <Alert severity="error">
              Could not load answers. Please try again.
            </Alert>
          ) : null}
          {displayedQuestions.map((q, index) => (
            <Stack gap={8} key={q.order}>
              <Typography variant="h6">
                {index + 1}. {q.questionText}
              </Typography>
              {q.options.map((option) => (
                <Typography key={option.id}>
                  {option.label}
                  {q.correctOptions?.includes(option.id)
                    ? ' — Correct answer'
                    : ''}
                  {review &&
                  attempt?.answers
                    ?.find((answer) => answer.order === q.order)
                    ?.selectedOptions.includes(option.id)
                    ? ' (Your answer)'
                    : ''}
                </Typography>
              ))}
            </Stack>
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
