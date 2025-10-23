import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ isCompleted, ...rest }: QuizProps) => {
  if (isCompleted) return <QuizCompleted />;

  return <TakeQuiz {...rest} />;
};
