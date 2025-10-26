import { Card, Stack, Typography } from '@mui/material';

import { QUESTION_TYPES } from '@/containers/CreateQuiz';
import { useRenderQuiz } from '@/context';
import { pxToRem } from '@/utils';

import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { MultipleSelectQuestion } from './MultipleSelectQuestion';

export const RenderQuestion = () => {
  const { questions, currentQuestionIndex } = useRenderQuiz();
  const question = questions[currentQuestionIndex];

  return (
    <Card
      sx={{
        padding: 32,
        borderRadius: pxToRem(12),
        background: '#1F2937',
        width: '100%',
        overflowY: 'auto',
      }}
    >
      <Stack gap={16}>
        <Typography sx={{ fontSize: pxToRem(16), fontWeight: 600 }}>
          {question.questionText}
        </Typography>
        <Typography sx={{ opacity: 0.6 }}>
          Select the best option(s) from the below:
        </Typography>
        {question.questionType === QUESTION_TYPES.singleSelect ? (
          <MultipleChoiceQuestion />
        ) : (
          <MultipleSelectQuestion />
        )}
      </Stack>
    </Card>
  );
};
