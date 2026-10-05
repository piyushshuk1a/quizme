import { RemoveRedEye } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { Button } from '@/components';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { useQuizContext } from '@/context';
import { useMutation } from '@/hooks';
import { pxToRem } from '@/utils';

import { QuestionPreview } from '../QuestionPanel/QuestionPreview';

import { getQuestionsForApi } from './Header.config';

import type { Complexity, CreateQuizPayload } from './Header.types';

export const Header = ({
  isEditing = false,
  disabled = false,
}: {
  isEditing?: boolean;
  disabled?: boolean;
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const {
    quizInfo,
    questions,
    validateQuizInfo,
    validateQuestion,
    resetCreateForm,
  } = useQuizContext();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { trigger: createQuiz, isMutating: isCreatingQuiz } =
    useMutation<CreateQuizPayload>({
      path: API_ENDPOINTS.createQuiz,
      onSuccess: () => {
        if (isEditing)
          enqueueSnackbar('Quiz updated! Your changes will be live shortly.', {
            variant: 'success',
          });
        else
          enqueueSnackbar('Your quiz has been created.', {
            variant: 'success',
          });
        resetCreateForm();
        navigate(`${ROUTES.listQuiz}?tab=myQuizzes`);
      },
      onError: (error) => {
        enqueueSnackbar(
          typeof error === 'string' ? error : 'Something went wrong',
          { variant: 'error' },
        );
      },
    });

  const validateBeforeSubmitOrPreview = () => {
    let hasError = questions.length === 0;

    // Validate quiz info and all questions
    const isQuizInfoValid = validateQuizInfo();
    const areQuestionsValid = questions
      .map((question) => validateQuestion(question.order))
      .every((isValid) => isValid);

    if (!isQuizInfoValid || !areQuestionsValid) {
      hasError = true;
    }

    if (hasError) {
      enqueueSnackbar('Please fix the errors', { variant: 'error' });
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    if (!validateBeforeSubmitOrPreview()) {
      return;
    }
    setPreviewOpen(true);
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!validateBeforeSubmitOrPreview()) {
      return;
    }

    const quizData = {
      id: quizInfo.id,
      title: quizInfo.title,
      description: quizInfo.description,
      category: quizInfo.category,
      isPublished: shouldPublish ?? false,
      durationMinutes: parseInt(quizInfo.duration),
      complexity: quizInfo.complexity as Complexity,
      questions: getQuestionsForApi(questions),
    };
    await createQuiz(quizData);
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      pt={12}
      pb={36}
    >
      <Stack maxWidth={pxToRem(500)}>
        <Typography component="h2" variant="h4">
          {isEditing ? 'Edit Quiz' : 'Create New Quiz'}
        </Typography>
        <Typography sx={{ opacity: 0.65 }}>
          Build engaging quizzes manually or use AI to generate questions
          automatically
        </Typography>
      </Stack>
      <Box display="flex" gap={16} alignItems="center">
        {isCreatingQuiz && <CircularProgress size={20} />}
        <Button
          color="secondary"
          startIcon={<RemoveRedEye sx={{ fontSize: 16 }} />}
          onClick={handlePreview}
          disabled={disabled || isCreatingQuiz}
        >
          Preview
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSave()}
          disabled={disabled || isCreatingQuiz}
          sx={{ height: 40 }}
        >
          Save Draft
        </Button>
        <Button
          onClick={() => handleSave(true)}
          disabled={disabled || isCreatingQuiz}
        >
          Publish Quiz
        </Button>
      </Box>
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{quizInfo.title}</DialogTitle>
        <DialogContent>
          <Stack gap={20}>
            <Typography>{quizInfo.description}</Typography>
            {questions.map((question, index) => (
              <QuestionPreview
                key={question.order}
                {...question}
                index={index}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close Preview</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
