import React from 'react';

import { useRenderQuiz } from '@/context';
import { useUserInfo } from '@/hooks';

import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ ...rest }: QuizProps) => {
  const { attempt, quizInfo } = useRenderQuiz();
  const { id: currentUserId } = useUserInfo();

  const durationMs = (quizInfo?.durationMinutes ?? 0) * 60 * 1000;

  const isOwner =
    quizInfo?.publishedBy && quizInfo.publishedBy === currentUserId;

  if (
    attempt?.status === 'completed' ||
    (attempt?.startedAt &&
      Date.now() - new Date(attempt.startedAt).getTime() > durationMs)
  ) {
    return <QuizCompleted />;
  }

  return <TakeQuiz {...rest} isOwner={Boolean(isOwner)} />;
};

export default Quiz;
