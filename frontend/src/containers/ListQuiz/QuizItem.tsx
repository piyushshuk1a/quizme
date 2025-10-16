import { AccessTime, Leaderboard, Stars } from '@mui/icons-material';
import { alpha, Box, Card, Chip, Stack, Typography } from '@mui/material';
import { generatePath, useNavigate } from 'react-router';

import { Button } from '@/components';
import { ROUTES } from '@/constants';

import type { QuizItemProps } from './ListQuiz.types';

const COMPLEXITY_CHIP_COLOR_MAP = {
  Easy: alpha('#08CB00', 0.7),
  Medium: alpha('#FCC61D', 0.6),
  Hard: alpha('#FFB5B5', 0.8),
  Advanced: alpha('#EE66A6', 0.7),
} as const;

export const QuizItem = ({
  id = '',
  title,
  durationMinutes,
  totalPoints,
  totalQuestions,
  category,
  complexity,
  isPublished,
  isMyQuiz = false,
}: QuizItemProps) => {
  const navigate = useNavigate();

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
        p: 24,
      }}
    >
      <Stack gap={12}>
        <Box display="flex" alignItems="center" gap={12}>
          <Typography variant="h5">{title}</Typography>
          <Chip
            size="small"
            sx={{
              borderColor: COMPLEXITY_CHIP_COLOR_MAP[complexity],
              color: COMPLEXITY_CHIP_COLOR_MAP[complexity],
            }}
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
        <Button
          variant="outlined"
          onClick={() => navigate(generatePath(ROUTES.editQuiz, { id }))}
        >
          Edit Quiz
        </Button>
      )}
      {isMyQuiz && isPublished && (
        <Button
          variant="outlined"
          onClick={() =>
            navigate(`${generatePath(ROUTES.quiz, { id })}?tab=invitations`)
          }
        >
          Invite Candidate
        </Button>
      )}
      {!isMyQuiz && (
        <Button
          variant="outlined"
          onClick={() => navigate(generatePath(ROUTES.quiz, { id }))}
        >
          Take Quiz
        </Button>
      )}
    </Card>
  );
};
