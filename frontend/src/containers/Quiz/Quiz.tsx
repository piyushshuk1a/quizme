import { useRenderQuiz } from '@/context';
import { useUserInfo } from '@/hooks';

import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ ...rest }: QuizProps) => {
  const { attempt, quizInfo } = useRenderQuiz();
  const { id: currentUserId } = useUserInfo();

  const isOwner =
    quizInfo?.publishedBy && quizInfo.publishedBy === currentUserId;

  if (attempt?.status === 'completed') {
    return <QuizCompleted />;
  }

  return <TakeQuiz {...rest} isOwner={Boolean(isOwner)} />;
};

export default Quiz;
