import { AccessTime, FormatListNumbered, Warning } from '@mui/icons-material';
import {
  Box,
  Card,
  darken,
  LinearProgress,
  Stack,
  Typography,
  type SxProps,
} from '@mui/material';

import { Button } from '@/components';
import { useRenderQuiz } from '@/context';
import { pxToRem } from '@/utils';

import type { ReactNode } from 'react';

const QUESTION_STATES = {
  current: 'current',
  answered: 'answered',
  unanswered: 'unanswered',
};
const QUESTION_STATE_TO_COLOR_MAP = {
  [QUESTION_STATES.current]: '#7C3AED',
  [QUESTION_STATES.answered]: '#16A34A',
  [QUESTION_STATES.unanswered]: '#374151',
};

const InfoItem = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <Box display="flex" gap={6} alignItems="center">
    {icon}
    <Typography variant="body2">{text}</Typography>
  </Box>
);

const QuestionColorIndicator = ({ state }: { state: string }) => (
  <Box display="flex" alignItems="center" gap={8}>
    <Box
      borderRadius={pxToRem(4)}
      width={pxToRem(12)}
      height={pxToRem(12)}
      bgcolor={
        QUESTION_STATE_TO_COLOR_MAP[
          state.toLowerCase() as keyof typeof QUESTION_STATE_TO_COLOR_MAP
        ]
      }
    ></Box>
    <Typography sx={{ opacity: 0.5 }} variant="body2">
      {state}
    </Typography>
  </Box>
);

export const AttemptQuizSidebar = () => {
  const {
    questions,
    currentQuestionIndex,
    userAnswers,
    goToQuestion,
    quizInfo,
  } = useRenderQuiz();

  const answeredCount = Object.values(userAnswers).filter(
    (answer) => answer.length > 0,
  ).length;

  const getBtnStyles = (index: number): SxProps => {
    const btnType =
      index === currentQuestionIndex
        ? QUESTION_STATES.current
        : userAnswers[index]?.length
          ? QUESTION_STATES.answered
          : QUESTION_STATES.unanswered;

    const hoverColor =
      btnType === 'unselected'
        ? '#6B7280'
        : darken(QUESTION_STATE_TO_COLOR_MAP[btnType], 0.1);

    return {
      borderRadius: pxToRem(8),
      width: pxToRem(40),
      height: pxToRem(40),
      background: QUESTION_STATE_TO_COLOR_MAP[btnType],
      border: 'none!important',
      minWidth: 'unset',

      '&:hover': {
        background: hoverColor,
        border: 'none',
      },
    };
  };

  return (
    <Stack
      height="calc(100vh - 72px)"
      borderRight="1px solid #374151"
      bgcolor="#1F2937"
      width={pxToRem(320)}
      position="relative"
      zIndex={1000}
      padding={20}
      gap={24}
    >
      <Stack gap={16}>
        <Typography sx={{ fontWeight: 800 }}>Quiz Instructions</Typography>
        <Card
          component={Stack}
          sx={{ background: '#374151', p: 16, borderRadius: pxToRem(8) }}
          gap={12}
        >
          <InfoItem
            icon={
              <AccessTime sx={{ fontSize: pxToRem(16), color: '#EF7722' }} />
            }
            text={`Time Limit: ${quizInfo.durationMinutes} Minutes`}
          />
          <InfoItem
            icon={
              <FormatListNumbered
                sx={{ fontSize: pxToRem(16), color: '#60A5FA' }}
              />
            }
            text={`Total Questions: ${quizInfo.totalQuestions}`}
          />
          <InfoItem
            icon={<Warning sx={{ fontSize: pxToRem(16), color: '#EAB308' }} />}
            text={`You can navigate freely between questions.`}
          />
        </Card>
      </Stack>
      <Stack gap={16}>
        <Typography sx={{ fontWeight: 800 }}>Question Overview</Typography>
        <Box display="flex" gap={12} flexWrap="wrap">
          {Array.from({ length: questions.length }).map((_, index) => (
            <Button
              key={index}
              variant="contained"
              onClick={() => goToQuestion(index)}
              sx={getBtnStyles(index)}
            >
              {index + 1}
            </Button>
          ))}
        </Box>
        <Box display="flex" justifyContent="space-between">
          <QuestionColorIndicator key="current" state="Current" />
          <QuestionColorIndicator key="answered" state="Answered" />
          <QuestionColorIndicator key="unanswered" state="Unanswered" />
        </Box>
      </Stack>
      <Card
        component={Stack}
        sx={{ background: '#374151', padding: 16, borderRadius: pxToRem(8) }}
        gap={16}
      >
        <Typography sx={{ fontWeight: 800 }}>Progress</Typography>
        <LinearProgress
          sx={{
            width: '100%',
            height: pxToRem(12),
            borderRadius: pxToRem(8),
            background: '#4B5563',
          }}
          variant="determinate"
          value={(answeredCount / Math.max(1, quizInfo.totalQuestions)) * 100}
        />
        <Typography sx={{ opacity: 0.5 }}>
          {answeredCount} of {quizInfo.totalQuestions} questions answered
        </Typography>
      </Card>
    </Stack>
  );
};
