import { AutoAwesome } from '@mui/icons-material';
import {
  Alert,
  Card,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { Button } from '@/components';
import { API_ENDPOINTS } from '@/constants';
import { useMutation } from '@/hooks';

import type { CreateQuizPayload, Complexity } from './Header/Header.types';

type Props = {
  onGenerated: (quiz: CreateQuizPayload) => void;
  onBusyChange: (busy: boolean) => void;
};

export const AiGeneration = ({ onGenerated, onBusyChange }: Props) => {
  const [prompt, setPrompt] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [complexity, setComplexity] = useState<Complexity>('Medium');
  const [error, setError] = useState('');
  const { trigger, isMutating } = useMutation<
    { prompt: string; questionCount: number; complexity: Complexity },
    void,
    CreateQuizPayload
  >({
    path: API_ENDPOINTS.generateQuiz,
    onError: (error) =>
      setError(
        typeof error === 'string'
          ? error
          : 'Could not generate quiz. Please try again.',
      ),
  });

  const handleGenerate = async () => {
    if (isMutating) return;
    const count = Number(questionCount);
    if (prompt.trim().length < 3 || prompt.trim().length > 4000) {
      setError('Describe your quiz in 3–4,000 characters.');
      return;
    }
    if (!Number.isInteger(count) || count < 1 || count > 20) {
      setError('Choose between 1 and 20 questions.');
      return;
    }
    setError('');
    onBusyChange(true);
    try {
      const quiz = await trigger({
        prompt: prompt.trim(),
        questionCount: count,
        complexity,
      });
      if (quiz) onGenerated(quiz);
    } finally {
      onBusyChange(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 24, background: '#1F2937' }}>
      <Stack gap={20}>
        <Typography variant="h6">Create a quiz with AI</Typography>
        <Typography>
          Describe a topic, audience, and what you want to test. AI will write
          the questions, answer choices, and correct answers.
        </Typography>
        <TextField
          label="Quiz prompt"
          multiline
          minRows={4}
          fullWidth
          value={prompt}
          disabled={isMutating}
          placeholder="Create a quiz on photosynthesis for class 8 students, covering chlorophyll, sunlight, and plant nutrition."
          onChange={(event) => setPrompt(event.target.value)}
          slotProps={{ htmlInput: { maxLength: 4000 } }}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={20}>
          <TextField
            label="Number of questions"
            type="number"
            value={questionCount}
            disabled={isMutating}
            onChange={(event) => setQuestionCount(event.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 20, step: 1 } }}
          />
          <TextField
            select
            label="Difficulty"
            value={complexity}
            disabled={isMutating}
            sx={{ minWidth: 180 }}
            onChange={(event) =>
              setComplexity(event.target.value as Complexity)
            }
          >
            {(['Easy', 'Medium', 'Hard', 'Advanced'] as const).map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Alert severity="info">
          Generation replaces the current editor contents after confirmation.
          Review the answers before saving or publishing.
        </Alert>
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          color="gradient"
          onClick={handleGenerate}
          disabled={isMutating || !prompt.trim()}
          startIcon={
            isMutating ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <AutoAwesome />
            )
          }
        >
          {isMutating ? 'Generating quiz…' : 'Generate Quiz'}
        </Button>
      </Stack>
    </Card>
  );
};
