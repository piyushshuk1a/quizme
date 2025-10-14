import type { Complexity, Question } from '../CreateQuiz';

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
  durationMinutes: number;
  totalQuestions: number;
  questions: Array<Omit<Question, 'correctOptions'>>;
}

export type QuizDataWithCorrectOptions = Omit<QuizData, 'questions'> & {
  questions: Question[];
};
