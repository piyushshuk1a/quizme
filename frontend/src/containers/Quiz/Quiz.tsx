// frontend/src/containers/Quiz/Quiz.tsx
import React from 'react';
import { useSearchParams } from 'react-router';

import InvitationsComponent from '@/containers/Quiz/Invitations';
import { useRenderQuiz } from '@/context';
import { useUserInfo } from '@/hooks';

import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ ...rest }: QuizProps) => {
  // hooks always run unconditionally and in the same order
  const { attempt, quizInfo } = useRenderQuiz();
  const [searchParams] = useSearchParams();
  const { id: currentUserId } = useUserInfo();

  // safe duration calculation (avoid crash if quizInfo is undefined)
  const durationMs = (quizInfo?.durationMinutes ?? 0) * 60 * 1000;

  // If quiz attempt is completed OR time window expired, show completed screen
  if (
    attempt?.status === 'completed' ||
    (attempt?.startedAt &&
      Date.now() - new Date(attempt?.startedAt).getTime() > durationMs)
  ) {
    return <QuizCompleted />;
  }

  const currentTab = searchParams.get('tab');

  // show invitations tab only to the owner of the quiz
  const isOwner = Boolean(
    quizInfo?.publishedBy && quizInfo.publishedBy === currentUserId,
  );

  if (currentTab === 'invitations' && isOwner) {
    return <InvitationsComponent quizId={quizInfo?.id} />;
  }

  return <TakeQuiz {...rest} />;
};

export default Quiz;
