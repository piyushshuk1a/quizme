import { Add, DeleteOutline } from '@mui/icons-material';
import {
  Box,
  Card,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
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
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components';
import { type OptionType, useQuizContext } from '@/context';
import { RED } from '@/theme';
import { pxToRem } from '@/utils';

import { QUESTION_TYPES } from './QuestionPanel.config';
import { QuestionPreview } from './QuestionPreview';

import type { QuestionPanelProps, QuestionType } from './QuestionPanel.types';

export const QuestionPanel = ({ order }: QuestionPanelProps) => {
  const {
    questions,
    updateQuestion,
    validateQuestion,
    getQuesValidationErrors,
  } = useQuizContext();
  const question = questions[order];
  const validationErrors = question.errors ?? {};
  const { enqueueSnackbar } = useSnackbar();
  const [showPreview, setShowPreview] = useState(false);
  const isFirstRender = useRef<boolean>(true);

  const handleOptionLabelChange = (id: string, newLabel: string) => {
    const updatedOptions = question.options.map((option) =>
      option.id === id ? { ...option, label: newLabel } : option,
    );
    updateQuestion(order, { ...question, options: updatedOptions });
  };

  const handleAddOption = () => {
    const newOption: OptionType = {
      id: Date.now().toString(),
      label: '',
      checked: false,
    };

    updateQuestion(order, {
      ...question,
      options: [...question.options, newOption],
    });
  };

  const handleDeleteOption = (id: string) => {
    const updatedOptions = question.options.filter(
      (option) => option.id !== id,
    );
    updateQuestion(order, { ...question, options: updatedOptions });
  };

  const handleMultiSelectAnsChange = (id: string, checked: boolean) => {
    const options = question?.options?.map((option) => {
      const isChecked = id === option.id ? checked : option.checked;
      return { ...option, checked: isChecked };
    });
    updateQuestion(order, { ...question, options });
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    const updatedOptions = question.options.map((option) => ({
      ...option,
      checked: false,
    }));
    updateQuestion(order, {
      ...question,
      questionType: type,
      options: updatedOptions,
    });
  };

  const handlePointsChange = (points: string) => {
    if (!points?.trim() || !isNaN(parseInt(points)))
      updateQuestion(order, { ...question, points });
  };

  const handleQuestionTextChange = (text: string) => {
    updateQuestion(order, { ...question, questionText: text });
  };

  useEffect(() => {
    const errors = getQuesValidationErrors(question);

    if (Object.keys(errors).length === 0 && isFirstRender.current) {
      setShowPreview(true);
    }

    isFirstRender.current = false;
  }, [question, order, getQuesValidationErrors]);

  const handleConfirm = () => {
    if (validateQuestion(order)) {
      setShowPreview(true);
    } else {
      enqueueSnackbar('Please fix the errors before confirming.', {
        variant: 'error',
      });
    }
  };

  if (!question) {
    return null; // If the question doesn't exist, return null
  }

  if (showPreview) {
    return (
      <QuestionPreview
        options={question.options}
        questionText={question.questionText}
        questionType={question.questionType}
        points={question.points}
        order={order}
        onEdit={() => setShowPreview(false)}
      />
    );
  }

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
          value={question.questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          error={!!validationErrors.questionText}
          helperText={validationErrors.questionText}
        />
        <FormControl fullWidth sx={{ mb: 24 }}>
          <InputLabel>Question Type</InputLabel>
          <Select
            value={question.questionType}
            onChange={(e) => handleQuestionTypeChange(e.target.value)}
            label="Question Type"
          >
            <MenuItem value={QUESTION_TYPES.singleSelect}>
              Single Select
            </MenuItem>
            <MenuItem value={QUESTION_TYPES.multiSelect}>Multi Select</MenuItem>
          </Select>
        </FormControl>

        {question.questionType === QUESTION_TYPES.singleSelect && (
          <RadioGroup
            sx={{ width: '100%' }}
            onChange={(event) => {
              const selectedId = event.target.value;
              const updatedOptions = question.options.map((option) => ({
                ...option,
                checked: option.id === selectedId,
              }));
              updateQuestion(order, { ...question, options: updatedOptions });
            }}
          >
            <Box display="flex" gap={10}>
              <InputLabel sx={{ mb: 12 }}>Answer Options</InputLabel>
              {(validationErrors.answer || validationErrors.options) && (
                <FormHelperText error>
                  {validationErrors.options ?? validationErrors.answer}
                </FormHelperText>
              )}
            </Box>
            {question.options.map((option) => (
              <Box key={option.id} display="flex" alignItems="center" mb={8}>
                <FormControlLabel
                  slotProps={{ typography: { sx: { width: '100%' } } }}
                  sx={{ width: '100%', marginRight: 0 }}
                  control={<Radio value={option.id} checked={option.checked} />}
                  label={
                    <TextField
                      fullWidth
                      error={
                        validationErrors.options ? !option.label?.trim() : false
                      }
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

        {question.questionType === QUESTION_TYPES.multiSelect && (
          <Stack gap={2} width="100%">
            <Box display="flex" gap={10}>
              <InputLabel sx={{ mb: 12 }}>Answer Options</InputLabel>
              {(validationErrors.answer || validationErrors.options) && (
                <FormHelperText error>
                  {validationErrors.options ?? validationErrors.answer}
                </FormHelperText>
              )}
            </Box>
            {question.options.map((option) => (
              <Box key={option.id} display="flex" alignItems="center" mb={8}>
                <Checkbox
                  sx={{ p: 0, mr: 8 }}
                  checked={option.checked}
                  onChange={(_e, checked) =>
                    handleMultiSelectAnsChange(option.id, checked)
                  }
                />
                <TextField
                  error={
                    validationErrors.options ? !option.label?.trim() : false
                  }
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
          <TextField
            label="Points"
            value={question.points.toString()}
            onChange={(e) => handlePointsChange(e.target.value)}
            error={!!validationErrors.points}
            helperText={validationErrors.points}
          />
          <Button size="large" onClick={handleConfirm}>
            Confirm
          </Button>
        </Box>
      </Stack>
    </Card>
  );
};
