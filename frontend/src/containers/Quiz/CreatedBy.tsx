import { Avatar, Box, Typography } from '@mui/material';

import { useRenderQuiz } from '@/context';

import { Card } from './Card';

export const CreatedBy = () => {
  const { quizInfo } = useRenderQuiz();

  return (
    <Card>
      <Typography sx={{ fontWeight: 600, mb: 10 }}>Created By</Typography>
      <Box display="flex" alignItems="center" gap={10}>
        <Avatar></Avatar>
        <Typography>{quizInfo.publishedByName}</Typography>
      </Box>
    </Card>
  );
};
