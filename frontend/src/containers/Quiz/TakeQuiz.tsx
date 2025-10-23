import { PlayArrow, Visibility } from '@mui/icons-material';
import { Box, Button, Stack, Typography } from '@mui/material';

import { Container } from '@/components';
import { useRenderQuiz } from '@/context';

import { CreatedBy } from './CreatedBy';
import { QuizDetails } from './QuizDetails';

import type { QuizProps } from './Quiz.types';

export const TakeQuiz = ({ isOwner }: Omit<QuizProps, 'isCompleted'>) => {
  const { quizInfo } = useRenderQuiz();

  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Container component={Stack} gap={20} width="100%">
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={20}
        >
          <Typography component="h1" variant="h4">
            {quizInfo.title}
          </Typography>
          {!isOwner && (
            <Button
              color="primary"
              variant="contained"
              startIcon={<PlayArrow />}
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
    </Box>
  );
};
