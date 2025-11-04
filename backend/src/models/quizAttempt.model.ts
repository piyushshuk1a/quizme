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
