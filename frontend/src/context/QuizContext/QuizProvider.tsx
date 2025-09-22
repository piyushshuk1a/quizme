import { useState } from 'react';

import { QuizContext, type QuestionConfig, type QuizInfo } from './QuizContext';
import {
  QUESTION_FORM_ERRORS,
  QUIZ_INFO_FORM_ERRORS,
} from './QuizProvider.config';

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [questions, setQuestions] = useState<QuestionConfig[]>([]);
  const [quizInfo, setQuizInfo] = useState<QuizInfo>({
    title: '',
    category: '',
    complexity: '',
    description: '',
    errors: {},
  });

  const addQuestion = (newQuestion: QuestionConfig) => {
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const getQuesValidationErrors = (
    ques: QuestionConfig,
  ): NonNullable<QuestionConfig['errors']> => {
    const question = ques;
    const validationErrors: Record<string, string> = {};

    // Validate question text
    if (!question.questionText.trim()) {
      validationErrors.questionText = QUESTION_FORM_ERRORS.questionTextRequired;
    }

    // Validate options
    if (question.options.length < 2) {
      validationErrors.options = QUESTION_FORM_ERRORS.twoOptionRequired;
    } else if (question.options.some((option) => !option.label.trim())) {
      validationErrors.options = QUESTION_FORM_ERRORS.optionLabelRequired;
    }

    // Validate answer selection
    if (!question.options.some((option) => option.checked)) {
      validationErrors.answer = QUESTION_FORM_ERRORS.answerRequired;
    }

    // Validate points
    const pointsValue = parseInt(question.points);
    if (!question.points || isNaN(pointsValue) || pointsValue <= 0) {
      validationErrors.points = QUESTION_FORM_ERRORS.pointsRequired;
    }

    return validationErrors;
  };

  const deleteQuestion = (order: number) => {
    setQuestions((prev) => {
      const newState = prev.filter((q) => q.order !== order);

      return [...newState];
    });
  };

  const updateQuestion = (order: number, updatedQuestion: QuestionConfig) => {
    setQuestions((prev) => {
      const updatedQuestions = [
        ...prev.map((q) => (q.order === order ? updatedQuestion : q)),
      ];

      // Revalidate if errors are there
      const errors =
        Object.keys(updatedQuestion.errors ?? {}).length > 0
          ? getQuesValidationErrors(updatedQuestion)
          : {};
      updatedQuestion.errors = errors;

      return updatedQuestions;
    });
  };

  const validateQuestion = (order: number): boolean => {
    const question = questions.find((q) => q.order === order) as QuestionConfig;
    const validationErrors = getQuesValidationErrors(question);

    // Update the question with errors
    const updatedQuestion = { ...question, errors: validationErrors };
    updateQuestion(order, updatedQuestion);

    return Object.keys(validationErrors).length === 0;
  };

  const updateQuizInfo = (updatedQuizInfo: QuizInfo) => {
    const errors =
      Object.keys(updatedQuizInfo.errors ?? {}).length > 0
        ? getQuizInfoValidationErrors(updatedQuizInfo)
        : {};
    updatedQuizInfo.errors = errors;

    setQuizInfo(updatedQuizInfo);
  };

  const getQuizInfoValidationErrors = (quizInfo: QuizInfo) => {
    const validationErrors: QuizInfo['errors'] = {};

    if (!quizInfo.title || quizInfo.title.trim().length < 10) {
      validationErrors.title = QUIZ_INFO_FORM_ERRORS.title;
    }

    if (!quizInfo.category) {
      validationErrors.category = QUIZ_INFO_FORM_ERRORS.category;
    }

    if (!quizInfo.complexity) {
      validationErrors.complexity = QUIZ_INFO_FORM_ERRORS.complexity;
    }

    if (!quizInfo.description || quizInfo.description.trim().length < 50) {
      validationErrors.description = QUIZ_INFO_FORM_ERRORS.description;
    }

    return validationErrors;
  };

  const validateQuizInfo = (): boolean => {
    const validationErrors = getQuizInfoValidationErrors(quizInfo);
    updateQuizInfo({ ...quizInfo, errors: validationErrors });

    return Object.keys(validationErrors).length === 0;
  };

  return (
    <QuizContext.Provider
      value={{
        quizInfo,
        questions,
        updateQuestion,
        addQuestion,
        validateQuestion,
        getQuesValidationErrors,
        updateQuizInfo,
        validateQuizInfo,
        getQuizInfoValidationErrors,
        deleteQuestion,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};
