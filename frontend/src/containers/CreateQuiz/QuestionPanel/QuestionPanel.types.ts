import type { QUESTION_TYPES } from './QuestionPanel.config';

export type QuestionType = ObjectValuesUnion<typeof QUESTION_TYPES>;

export type QuestionPanelProps = {
  order: number;
  questionText?: string;
  questionId?: string;
  questionType?: QuestionType;
  options?: string[];
  correctAnswer?: string[];
  point?: number;
};
