import { AccessTime, Leaderboard, Stars } from '@mui/icons-material';
import { Box, Card, Chip, Stack, Typography } from '@mui/material';

import { Button } from '@/components';

import type { QuizItemProps } from './ListQuiz.types';

const COMPLEXITY_CHIP_COLOR_MAP = {
  Easy: 'success',
  Medium: 'info',
  Hard: 'warning',
  Advanced: 'error',
} as const;

export const QuizItem = ({
  title,
  durationMinutes,
  totalPoints,
  totalQuestions,
  category,
  complexity,
  isPublished,
  isMyQuiz = false,
}: QuizItemProps) => {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#1F2937',
        p: 16,
      }}
    >
      <Stack gap={10}>
        <Box display="flex" alignItems="center" gap={12}>
          <Typography variant="h5">{title}</Typography>
          <Chip
            size="small"
            color={COMPLEXITY_CHIP_COLOR_MAP[complexity]}
            variant="outlined"
            label={complexity}
          />
        </Box>
        <Box display="flex" gap={60}>
          <Box display="flex" alignItems="center" gap={6} sx={{ opacity: 0.8 }}>
            <AccessTime sx={{ fontSize: 16 }} />
            <Typography fontSize="smaller">
              {durationMinutes} Minutes
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={6} sx={{ opacity: 0.8 }}>
            <Leaderboard sx={{ fontSize: 16 }} />
            <Typography fontSize="smaller">
              {totalQuestions} Questions
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={6} sx={{ opacity: 0.8 }}>
            <Stars sx={{ fontSize: 16 }} />
            <Typography fontSize="smaller">{totalPoints} Points</Typography>
          </Box>
        </Box>
      </Stack>
      <Chip sx={{ background: '#374151' }} label={category} />
      {isMyQuiz && !isPublished && (
        <Button variant="outlined">Edit Quiz</Button>
      )}
      {isMyQuiz && isPublished && (
        <Button variant="outlined">View Details</Button>
      )}
      {!isMyQuiz && <Button variant="outlined">Take Quiz</Button>}
    </Card>
  );
};
