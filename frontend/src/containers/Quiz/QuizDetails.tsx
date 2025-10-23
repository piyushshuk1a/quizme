import { Box, Chip, Stack, Typography } from '@mui/material';

import { useRenderQuiz } from '@/context';

import { COMPLEXITY_CHIP_COLOR_MAP } from '../ListQuiz';

import { Card } from './Card';
import { InfoCard } from './InfoCard';

export const QuizDetails = ({ smallView = false }: { smallView?: boolean }) => {
  const { quizInfo } = useRenderQuiz();
  const complexity = quizInfo.complexity;

  return (
    <Card>
      <Stack gap={16}>
        <Typography component="h2" variant="h6">
          Quiz Details
        </Typography>
        <Box>
          <Typography component="h3" sx={{ fontWeight: 500, mb: 8 }}>
            Description
          </Typography>
          <Typography variant="body2">{quizInfo.description}</Typography>
        </Box>
        <Box
          display="flex"
          gap={16}
          flexDirection={smallView ? 'column' : 'row'}
        >
          <InfoCard
            label="Questions"
            value={quizInfo.totalQuestions.toString()}
            color="primary.main"
          />
          <InfoCard
            label="Minutes"
            value={quizInfo.durationMinutes.toString()}
            color="success.main"
          />
          <InfoCard
            label="Points"
            value={quizInfo.totalPoints.toString()}
            color="#60A5FA"
          />
        </Box>
        <Box display="flex">
          <Box width="50%">
            <Typography sx={{ opacity: 0.6, mb: 6 }} variant="body2">
              Complexity
            </Typography>
            <Chip
              size="small"
              sx={{
                background: COMPLEXITY_CHIP_COLOR_MAP[complexity],
                color: 'white',
              }}
              label={complexity}
            />
          </Box>
          <Box width="50%">
            <Typography sx={{ opacity: 0.6, mb: 6 }} variant="body2">
              Category
            </Typography>
            <Chip size="small" color="primary" label={quizInfo.category} />
          </Box>
        </Box>
      </Stack>
    </Card>
  );
};
