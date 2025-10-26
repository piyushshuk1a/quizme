import { Star } from '@mui/icons-material';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';

import { useRenderQuiz } from '@/context';
import { pxToRem } from '@/utils';

import { QUESTION_TYPES } from '../../CreateQuiz';

export const QuestionHeader = () => {
  const { quizInfo, questions, currentQuestionIndex, userAnswers } =
    useRenderQuiz();

  const QUESTION_TYPE_TO_HEADER_MAP = {
    [QUESTION_TYPES.multiSelect]: 'Multiple Select Question',
    [QUESTION_TYPES.singleSelect]: 'Multiple Choice Question',
  };
  const question = questions[currentQuestionIndex];
  const answeredQuestions = Object.keys(userAnswers).length;

  return (
    <Stack width="100%" gap={12}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Stack gap={4}>
          <Typography variant="body2" sx={{ opacity: 0.4 }}>
            Question {currentQuestionIndex + 1} of {quizInfo.totalQuestions}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {QUESTION_TYPE_TO_HEADER_MAP[question.questionType]}
          </Typography>
        </Stack>
        <Box display="flex" alignItems="center" gap={6} sx={{ opacity: 0.5 }}>
          <Star sx={{ fontSize: 16 }} />
          <Typography>{question.points} Points</Typography>
        </Box>
      </Box>
      <LinearProgress
        sx={{
          width: '100%',
          height: pxToRem(4),
          borderRadius: pxToRem(2),
          background: '#4B5563',
        }}
        variant="determinate"
        value={(answeredQuestions / quizInfo.totalQuestions) * 100}
      />
    </Stack>
  );
};
