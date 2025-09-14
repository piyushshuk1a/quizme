import {
  Autocomplete,
  Box,
  Card,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { QUIZ_CATEGORIES } from './QuizInfo.config';

export const QuizInfo = () => {
  return (
    <Card
      variant="outlined"
      sx={{ width: '100%', p: 20, borderRadius: 2, background: '#1F2937' }}
    >
      <Stack gap={16} width="100%">
        <Typography variant="h6">Quiz Information</Typography>
        <Stack gap={16} width="100%">
          <Box display="flex" gap={16} width="100%">
            <TextField required fullWidth label="Quiz Title" />
            <Autocomplete
              sx={{ width: '100%' }}
              options={QUIZ_CATEGORIES}
              renderInput={(params) => (
                <TextField required {...params} label="Category" />
              )}
            />
          </Box>
          <TextField
            required
            fullWidth
            label="Description"
            multiline
            rows={3}
          />
        </Stack>
      </Stack>
    </Card>
  );
};
