import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import InvitationsDialog from '@/containers/Quiz/InvitationsDialog';
import { useRenderQuiz } from '@/context';
import { useUserInfo } from '@/hooks';

import { QuizCompleted } from './QuizCompleted';
import { TakeQuiz } from './TakeQuiz';

import type { QuizProps } from './Quiz.types';

export const Quiz = ({ ...rest }: QuizProps) => {
  // Hook calls must be at top-level (before any possible early returns)
  const { attempt, quizInfo } = useRenderQuiz();
  const [searchParams, setSearchParams] = useSearchParams();
  const { id: currentUserId } = useUserInfo();

  // dialog open state (hook at top-level)
  const [openInvitations, setOpenInvitations] = useState(false);

  // safe duration calculation (avoid crash if quizInfo is undefined)
  const durationMs = (quizInfo?.durationMinutes ?? 0) * 60 * 1000;

  // determine whether current user is owner (owner can invite)
  const isOwner = Boolean(
    quizInfo?.publishedBy && quizInfo.publishedBy === currentUserId,
  );

  // open dialog when ?tab=invitations and user is owner
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'invitations' && isOwner) {
      setOpenInvitations(true);
    } else {
      setOpenInvitations(false);
    }
  }, [searchParams, isOwner]);

  // If quiz attempt is completed OR time window expired, show completed screen
  if (
    attempt?.status === 'completed' ||
    (attempt?.startedAt &&
      Date.now() - new Date(attempt?.startedAt).getTime() > durationMs)
  ) {
    return <QuizCompleted />;
  }

  const handleCloseInvitations = () => {
    setOpenInvitations(false);

    // remove tab param from URL when dialog closed
    const next = new URLSearchParams(searchParams);
    next.delete('tab');
    setSearchParams(next);
  };

  return (
    <>
      {/* Invitations dialog — quizId is passed down */}
      <InvitationsDialog
        open={openInvitations}
        onClose={handleCloseInvitations}
        quizId={quizInfo?.id}
      />

      {/* regular quiz UI */}
      <TakeQuiz {...rest} />
    </>
  );
};
