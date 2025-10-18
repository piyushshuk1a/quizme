import { createContext } from 'react';

import type { QuizData } from '@/containers';

interface RenderQuizState {
  quizInfo: Omit<QuizData, 'questions'>;
  questions: QuizData['questions'];
  currentQuestionIndex: number;
  userAnswers: Record<number, string[]>;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  setAnswer: (order: number, answer: string[]) => void;
}

export const RenderQuizContext = createContext<RenderQuizState | undefined>(
  undefined,
);
