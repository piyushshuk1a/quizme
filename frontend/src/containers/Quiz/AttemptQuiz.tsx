import { AccessTimeFilled } from '@mui/icons-material';
import { Box, LinearProgress, Stack, Typography } from '@mui/material';

import { Button } from '@/components';
import { useRenderQuiz } from '@/context';
import { THEME_COLORS } from '@/theme';
import { pxToRem } from '@/utils';

import { AttemptQuizSidebar } from './AttemptQuizSidebar';
import { Question } from './Question';

import type { AttemptQuizProps } from './Quiz.types';

export const AttemptQuiz = ({
  isOpen,
  remainingTime,
  onSubmit,
  isSubmitting,
}: AttemptQuizProps) => {
  const { quizInfo } = useRenderQuiz();

  return (
    <Stack
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={10000}
      bgcolor={THEME_COLORS.background.default}
      sx={{
        transition: 'transform 250ms ease-in',
        transform: isOpen ? 'scale(1)' : 'scale(0)',
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        height={pxToRem(72)}
        padding={pxToRem(0, 24)}
        borderBottom="1px solid #374151"
        bgcolor="#1F2937"
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {quizInfo.title}
        </Typography>
        <Box display="flex" gap={10} alignItems="center">
          <Box display="flex" alignItems="center" gap={4} sx={{ opacity: 0.4 }}>
            <AccessTimeFilled sx={{ fontSize: 16 }} />
            <Typography variant="body2">{remainingTime}</Typography>
          </Box>
          <Button variant="text" onClick={onSubmit} disabled={isSubmitting}>
            Submit
          </Button>
        </Box>
      </Box>
      <Box display="flex" position="relative">
        {isSubmitting && (
          <LinearProgress sx={{ position: 'absolute', left: 0, right: 0 }} />
        )}
        <AttemptQuizSidebar />
        <Box
          height="calc(100vh - 72px)"
          width="calc(100% - 320px)"
          display="flex"
          justifyContent="center"
        >
          <Question />
        </Box>
      </Box>
    </Stack>
  );
};
