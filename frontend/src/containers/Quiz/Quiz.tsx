import { useRenderQuiz } from '@/context';

import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ ...rest }: QuizProps) => {
  const { attempt, quizInfo } = useRenderQuiz();
  const durationMs = quizInfo.durationMinutes * 60 * 1000;

  if (
    attempt?.status === 'completed' ||
    (attempt?.startedAt &&
      Date.now() - new Date(attempt?.startedAt).getTime() > durationMs)
  )
    return <QuizCompleted />;

  return <TakeQuiz {...rest} />;
};
