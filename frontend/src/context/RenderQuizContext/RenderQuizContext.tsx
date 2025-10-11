import { createContext } from 'react';

import type { Question } from '@/containers';

import type { QuizInfo } from '../QuizContext';

interface RenderQuizState {
  quizInfo: QuizInfo;
  questions: (Omit<Question, 'correctOptions'> & {
    correctOptions?: string[];
  })[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string[]>;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setAnswer: (order: number, answer: string[]) => void;
}

export const RenderQuizContext = createContext<RenderQuizState | undefined>(
  undefined,
);
