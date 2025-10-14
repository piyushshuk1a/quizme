import { RemoveRedEye } from '@mui/icons-material';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router';

import { Button } from '@/components';
import { API_ENDPOINTS, ROUTES } from '@/constants';
import { useQuizContext } from '@/context';
import { useMutation } from '@/hooks';
import { pxToRem } from '@/utils';

import { getQuestionsForApi } from './Header.config';

import type { Complexity, CreateQuizPayload } from './Header.types';

export const Header = ({ isEditing = false }: { isEditing?: boolean }) => {
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
    let hasError = false;

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
  };

  const handleSave = async (shouldPublish?: boolean) => {
    if (!validateBeforeSubmitOrPreview()) {
      return;
    }

    const quizData = {
      ...quizInfo,
      isPublished: shouldPublish,
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
          disabled={isCreatingQuiz}
        >
          Preview
        </Button>
        <Button
          variant="outlined"
          onClick={() => handleSave()}
          disabled={isCreatingQuiz}
          sx={{ height: 40 }}
        >
          Save Draft
        </Button>
        <Button onClick={() => handleSave(true)} disabled={isCreatingQuiz}>
          Publish Quiz
        </Button>
      </Box>
    </Box>
  );
};
