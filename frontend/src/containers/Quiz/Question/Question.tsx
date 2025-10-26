import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Box, Button, Stack } from '@mui/material';

import { useRenderQuiz } from '@/context';

import { QuestionHeader } from './QuestionHeader';
import { RenderQuestion } from './RenderQuestion';

export const Question = () => {
  const {
    goToNextQuestion,
    goToPreviousQuestion,
    currentQuestionIndex,
    quizInfo,
  } = useRenderQuiz();

  return (
    <Stack width="100%" gap={32} p={32} maxWidth={800}>
      <QuestionHeader />
      <RenderQuestion />
      <Box display="flex" justifyContent="space-between" width="100%">
        <Button
          variant="contained"
          startIcon={<ChevronLeft sx={{ fontSize: 16 }} />}
          disabled={currentQuestionIndex === 0}
          onClick={goToPreviousQuestion}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          endIcon={<ChevronRight sx={{ fontSize: 16 }} />}
          disabled={currentQuestionIndex === quizInfo.totalQuestions - 1}
          onClick={goToNextQuestion}
        >
          Next
        </Button>
      </Box>
    </Stack>
  );
};
