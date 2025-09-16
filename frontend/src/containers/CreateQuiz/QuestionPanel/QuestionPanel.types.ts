import type { OptionType } from '@/context';

import type { QUESTION_TYPES } from './QuestionPanel.config';

export type QuestionType = ObjectValuesUnion<typeof QUESTION_TYPES>;

export type QuestionPanelProps = {
  order: number;
};

export type QuestionPreviewProps = {
  options: OptionType[];
  questionText: string;
  points: string;
  questionType: string;
  order: number;
  onEdit?: () => void;
};
