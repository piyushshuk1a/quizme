import { RemoveRedEye } from '@mui/icons-material';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { Button, Container } from '@/components';
import { pxToRem } from '@/utils';

export const CreateQuiz = () => {
  return (
    <Stack gap={12} style={{ padding: 24 }} alignItems="center">
      <Container width="100%">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          pt={12}
          pb={36}
        >
          <Stack maxWidth={pxToRem(500)}>
            <Typography component="h2" variant="h4">
              Create New Quiz
            </Typography>
            <Typography sx={{ opacity: 0.65 }}>
              Build engaging quizzes manually or use AI to generate questions
              automatically
            </Typography>
          </Stack>
          <Box display="flex" gap={16}>
            <Button
              color="secondary"
              startIcon={<RemoveRedEye sx={{ fontSize: 16 }} />}
            >
              Preview
            </Button>
            <Button variant="outlined">Save Draft</Button>
            <Button>Publish Quiz</Button>
          </Box>
        </Box>
      </Container>
      <TextField label="TextField" />
      <FormControl>
        <InputLabel id="demo-simple-select-label">Age</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          label="Age"
        >
          <MenuItem value={10}>Ten</MenuItem>
          <MenuItem value={20}>Twenty</MenuItem>
          <MenuItem value={30}>Thirty</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel control={<Checkbox defaultChecked />} label="Label" />
      <FormControl>
        <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
        <RadioGroup
          aria-labelledby="demo-radio-buttons-group-label"
          defaultValue="female"
          name="radio-buttons-group"
        >
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
      </FormControl>
    </Stack>
  );
};
