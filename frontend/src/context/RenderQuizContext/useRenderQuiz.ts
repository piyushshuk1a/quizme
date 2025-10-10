import { useContext } from 'react';

import { RenderQuizContext } from './RenderQuizContext';

export const useRenderQuiz = () => {
  const context = useContext(RenderQuizContext);

  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }

  return context;
};
