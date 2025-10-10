import { createContext } from 'react';

import type { Question } from '@/containers';

interface RenderQuizState {
  questions: Question[];
  currentQuestionIndex: number;
  userAnswers: Record<number, string[]>;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setAnswer: (order: number, answer: string[]) => void;
}

export const RenderQuizContext = createContext<RenderQuizState | undefined>(
  undefined,
);
