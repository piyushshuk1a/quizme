import { Add, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { Button } from '@/components';
import { RED } from '@/theme';
import { pxToRem } from '@/utils';

import { QUESTION_TYPES } from './QuestionPanel.config';

import type { QuestionPanelProps, QuestionType } from './QuestionPanel.types';

export const QuestionPanel = ({ order }: QuestionPanelProps) => {
  const [questionType, setQuestionType] = useState<string>(
    QUESTION_TYPES.singleSelect,
  );
  const [options, setOptions] = useState<
    { id: string; label: string; checked: boolean }[]
  >([
    { id: '1', label: '', checked: false },
    { id: '2', label: '', checked: false },
  ]);
  const { enqueueSnackbar } = useSnackbar();

  const handleOptionLabelChange = (id: string, newLabel: string) => {
    const option = options.find(({ id: optionId }) => id === optionId);

    if (option?.checked && !newLabel?.trim()) {
      enqueueSnackbar('Unselect before clearing the option', {
        variant: 'error',
      });
      return;
    }

    setOptions((prevOptions) =>
      prevOptions.map((option) =>
        option.id === id ? { ...option, label: newLabel } : option,
      ),
    );
  };

  const handleMultiSelectAnsChange = (id: string, checked: boolean) => {
    const option = options.find(({ id: optionId }) => id === optionId);

    if (!option?.label?.trim()) {
      enqueueSnackbar('Please update the answer first', {
        variant: 'error',
      });
      return;
    }

    setOptions((prev) => {
      const newState = prev.map((option) => {
        const isChecked = id === option.id ? checked : option.checked;
        return { ...option, checked: isChecked };
      });
      return [...newState];
    });
  };

  const handleAddOption = () => {
    const newOption = {
      id: Date.now().toString(),
      label: ``,
      checked: false,
    };
    setOptions((prevOptions) => [...prevOptions, newOption]);
  };

  const handleDeleteOption = (id: string) => {
    setOptions((prevOptions) =>
      prevOptions.filter((option) => option.id !== id),
    );
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setOptions((prev) => [
      ...prev.map((option) => ({ ...option, checked: false })),
    ]);
    setQuestionType(type);
  };

  return (
    <Card
      variant="outlined"
      sx={{ width: '100%', p: 20, borderRadius: 2, background: '#1F2937' }}
    >
      <Stack alignItems="flex-start">
        <Typography variant="h6" mb={24}>
          Question {order + 1}
        </Typography>
        <TextField
          label="Question Text"
          placeholder="Enter your question here"
          multiline
          fullWidth
          sx={{ mb: 24 }}
          rows={4}
        />

        <FormControl fullWidth sx={{ mb: 24 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={questionType}
            onChange={(e) => handleQuestionTypeChange(e.target.value)}
            label="Question Type"
          >
            <MenuItem value={QUESTION_TYPES.singleSelect}>
              Single Select
            </MenuItem>
            <MenuItem value={QUESTION_TYPES.multiSelect}>Multi Select</MenuItem>
          </Select>
        </FormControl>

        {questionType === QUESTION_TYPES.singleSelect && (
          <RadioGroup
            sx={{ width: '100%' }}
            onChange={(event) => {
              const selectedId = event.target.value;
              setOptions((prevOptions) =>
                prevOptions.map((option) => ({
                  ...option,
                  checked: option.id === selectedId,
                })),
              );
            }}
          >
            <InputLabel sx={{ mb: 12 }}>Answer Options</InputLabel>
            {options.map((option) => (
              <Box key={option.id} display="flex" alignItems="center" mb={8}>
                <FormControlLabel
                  slotProps={{ typography: { sx: { width: '100%' } } }}
                  sx={{ width: '100%', marginRight: 0 }}
                  control={<Radio value={option.id} checked={option.checked} />}
                  label={
                    <TextField
                      fullWidth
                      placeholder="Enter the option value"
                      value={option.label}
                      onChange={(e) =>
                        handleOptionLabelChange(option.id, e.target.value)
                      }
                    />
                  }
                />
                <IconButton onClick={() => handleDeleteOption(option.id)}>
                  <DeleteOutline
                    sx={{ fontSize: pxToRem(20), color: RED[500] }}
                  />
                </IconButton>
              </Box>
            ))}
          </RadioGroup>
        )}

        {questionType === QUESTION_TYPES.multiSelect && (
          <Stack gap={2} width="100%">
            <InputLabel sx={{ mb: 12 }}>Answer Options</InputLabel>
            {options.map((option) => (
              <Box key={option.id} display="flex" alignItems="center" mb={8}>
                <Checkbox
                  sx={{ p: 0, mr: 8 }}
                  checked={option.checked}
                  onChange={(_e, checked) =>
                    handleMultiSelectAnsChange(option.id, checked)
                  }
                />
                <TextField
                  fullWidth
                  placeholder="Enter the option value"
                  value={option.label}
                  onChange={(e) =>
                    handleOptionLabelChange(option.id, e.target.value)
                  }
                />
                <IconButton onClick={() => handleDeleteOption(option.id)}>
                  <DeleteOutline
                    sx={{ fontSize: pxToRem(20), color: RED[500] }}
                  />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Button
          startIcon={<Add />}
          onClick={handleAddOption}
          sx={{ marginTop: 2 }}
          variant="text"
        >
          Add Option
        </Button>

        <Box
          display="flex"
          width="100%"
          mt={20}
          pt={20}
          borderTop="1px solid #35363a"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField label="Points" type="number" />
          <Button size="large">Confirm</Button>
        </Box>
      </Stack>
    </Card>
  );
};
