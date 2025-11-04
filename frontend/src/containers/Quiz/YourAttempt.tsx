import { AccessTime, Check, Close } from '@mui/icons-material';
import { alpha, Box, Stack, Typography } from '@mui/material';

import { useRenderQuiz } from '@/context';
import { pxToRem } from '@/utils';

import { Card } from './Card';

import type { QuizResultInfoProps } from './Quiz.types';

export const QuizResultInfo = ({
  color,
  label,
  value,
  icon,
}: QuizResultInfoProps) => (
  <Stack
    p={20}
    gap={10}
    width="100%"
    borderRadius={4}
    alignItems="center"
    justifyContent="center"
    bgcolor={alpha(color, 0.1)}
    border={`1px solid ${alpha(color, 0.4)}`}
  >
    <Box
      width={50}
      height={50}
      bgcolor={color}
      display="flex"
      borderRadius="100%"
      alignItems="center"
      justifyContent="center"
    >
      {icon}
    </Box>
    <Typography sx={{ color, fontWeight: 600 }} variant="h4">
      {value}
    </Typography>
    <Typography sx={{ opacity: 0.9 }}>{label}</Typography>
  </Stack>
);

export const YourAttempt = () => {
  const { attempt, quizInfo } = useRenderQuiz();

  const timeTake =
    !attempt?.startedAt || !attempt.completedAt
      ? quizInfo.durationMinutes
      : (new Date(attempt.completedAt).getTime() -
          new Date(attempt.startedAt).getTime()) /
        (1000 * 60);

  return (
    <Card
      sx={{
        gap: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={pxToRem(150)}
        height={pxToRem(150)}
        borderRadius="100%"
        border={`3px solid ${alpha('#08CB00', 0.6)}`}
        bgcolor={alpha('#08CB00', 0.3)}
      >
        <Typography variant="h4" component="span">
          {attempt?.percentage ?? 0}%
        </Typography>
      </Box>
      <Stack gap={8}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Quiz Complete
        </Typography>
        <Typography sx={{ opacity: 0.8 }}>
          You scored {attempt?.score ?? 0} out of {attempt?.maxPossibleScore}
        </Typography>
      </Stack>
      <Box display="flex" gap={20} width="100%">
        <QuizResultInfo
          color="#22C55E"
          label="Correct Answers"
          value={attempt?.answers?.filter((ans) => ans.isCorrect).length ?? 0}
          icon={<Check sx={{ fontSize: 28 }} />}
        />
        <QuizResultInfo
          color="#EF4444"
          label="Incorrect Answers"
          value={attempt?.answers?.filter((ans) => !ans.isCorrect).length ?? 0}
          icon={<Close sx={{ fontSize: 28 }} />}
        />
        <QuizResultInfo
          color="#3B82F6"
          label="Time Taken"
          value={timeTake.toFixed(2)}
          icon={<AccessTime sx={{ fontSize: 28 }} />}
        />
      </Box>
    </Card>
  );
};
