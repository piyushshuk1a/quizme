import { type ReactNode } from 'react';

import { type Complexity, type Question } from '../CreateQuiz';

export interface QuizData {
  id?: string;
  title: string;
  description: string;
  complexity: Complexity;
  category: string;
  isPublic?: boolean;
  totalPoints: number;
  isPublished?: boolean;
  publishedBy?: string;
  publishedByName?: string;
  durationMinutes: number;
  totalQuestions: number;
  questions: Array<
    Omit<Question, 'correctOptions'> & { correctOptions?: string }
  >;
}

export type QuizDataWithCorrectOptions = Omit<QuizData, 'questions'> & {
  questions: Question[];
};

export type InfoCardProps = { label: string; value: string; color: string };

export type QuizProps = {
  isOwner: boolean;
  isAdmin: boolean;
  isCompleted: boolean;
};

export type QuizResultInfoProps = {
  color: string;
  value: string | number;
  label: string;
  icon: ReactNode;
};

export type AttemptQuizProps = {
  isOpen: boolean;
  onClose: () => void;
  remainingTime: string;
  onSubmit: () => void;
  isSubmitting: boolean;
};

export interface QuizAttempt {
  attemptId?: string;
  quizId: string;
  userId: string;
  score?: number;
  maxPossibleScore: number;
  percentage?: number;
  startedAt: string;
  completedAt?: string;
  status: 'completed' | 'in_progress';
  answers?: Array<{
    order: number;
    selectedOptions: string[];
    isCorrect: boolean;
  }>;
}
