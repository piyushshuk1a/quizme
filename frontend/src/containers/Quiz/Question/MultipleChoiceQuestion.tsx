import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';

import { useRenderQuiz } from '@/context';

export const MultipleChoiceQuestion = () => {
  const { questions, currentQuestionIndex, userAnswers, setAnswer } =
    useRenderQuiz();

  const question = questions[currentQuestionIndex];
  const answers = userAnswers[currentQuestionIndex] ?? [];

  return (
    <RadioGroup
      sx={{ width: '100%' }}
      onChange={(event) => {
        const selectedId = event.target.value;
        setAnswer(currentQuestionIndex, [selectedId]);
      }}
    >
      {question.options.map((option) => (
        <Box
          key={option.id}
          display="flex"
          alignItems="center"
          mb={11}
          gap={18}
        >
          <FormControlLabel
            slotProps={{ typography: { sx: { width: '100%' } } }}
            sx={{ width: '100%', marginRight: 0 }}
            control={
              <Radio value={option.id} checked={answers.includes(option.id)} />
            }
            label={option.label}
          />
        </Box>
      ))}
    </RadioGroup>
  );
};
