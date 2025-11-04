import { createContext } from 'react';

import type { QuizAttempt, QuizData } from '@/containers';

interface RenderQuizState {
  quizInfo: Omit<QuizData, 'questions'>;
  attempt?: QuizAttempt;
  questions: QuizData['questions'];
  currentQuestionIndex: number;
  userAnswers: Record<number, string[]>;
  goToNextQuestion: () => void;
  goToPreviousQuestion: () => void;
  goToQuestion: (index: number) => void;
  setAnswer: (index: number, answer: string[]) => void;
}

export const RenderQuizContext = createContext<RenderQuizState | undefined>(
  undefined,
);
