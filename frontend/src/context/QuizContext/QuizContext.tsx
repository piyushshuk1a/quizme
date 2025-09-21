import { createContext } from 'react';

export type OptionType = { id: string; label: string; checked: boolean };

export type QuestionConfig = {
  order: number;
  questionType: string;
  questionText: string;
  options: OptionType[];
  points: string;
  errors?: {
    questionText?: string;
    options?: string;
    answer?: string;
    points?: string;
  };
};

export type QuizInfo = {
  title: string;
  category: string;
  complexity: string;
  description?: string;
  errors?: {
    title?: string;
    category?: string;
    complexity?: string;
    description?: string;
  };
};

type QuizContextType = {
  // Quiz Info
  quizInfo: QuizInfo;
  updateQuizInfo: (quizInfo: QuizInfo) => void;
  validateQuizInfo: () => boolean;
  getQuizInfoValidationErrors: (
    info: QuizContextType['quizInfo'],
  ) => NonNullable<QuizInfo['errors']>;

  // Questions
  questions: QuestionConfig[];
  updateQuestion: (order: number, updatedQuestion: QuestionConfig) => void;
  addQuestion: (newQuestion: QuestionConfig) => void;
  validateQuestion: (order: number) => boolean;
  getQuesValidationErrors: (
    question: QuestionConfig,
  ) => NonNullable<QuestionConfig['errors']>;
  deleteQuestion: (order: number) => void;
};

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined,
);
