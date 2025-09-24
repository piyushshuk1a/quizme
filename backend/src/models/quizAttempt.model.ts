import { Timestamp } from 'firebase/firestore';

export interface QuizAttempt {
  attemptId?: string;
  quizId: string;
  title: string;
  score: number;
  maxPossibleScore: number;
  percentage: number;
  completedAt?: Timestamp;
  status: 'completed' | 'in_progress';
  answers?: Array<{
    questionId: string;
    userAnswerIds: string[];
    isCorrect: boolean;
  }>;
}
