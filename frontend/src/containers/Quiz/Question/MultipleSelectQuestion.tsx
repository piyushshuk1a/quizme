import { Box, Checkbox, FormLabel, Stack } from '@mui/material';

import { useRenderQuiz } from '@/context';

export const MultipleSelectQuestion = () => {
  const { questions, currentQuestionIndex, userAnswers, setAnswer } =
    useRenderQuiz();
  const question = questions[currentQuestionIndex];
  const answers = userAnswers[currentQuestionIndex] ?? [];

  const handleMultiSelectAnsChange = (optionId: string, checked: boolean) => {
    const newAnswer = answers.filter((id) => id != optionId);
    if (checked) newAnswer.push(optionId);

    setAnswer(currentQuestionIndex, [...newAnswer]);
  };

  return (
    <Stack gap={2} width="100%">
      {question.options.map((option) => (
        <Box key={option.id} display="flex" alignItems="center" mb={8} gap={16}>
          <Box display="flex" width="100%">
            <Checkbox
              sx={{ p: 0, mr: 8 }}
              checked={answers.includes(option.id)}
              onChange={(_e, checked) =>
                handleMultiSelectAnsChange(option.id, checked)
              }
            />
            <FormLabel>{option.label}</FormLabel>
          </Box>
        </Box>
      ))}
    </Stack>
  );
};
