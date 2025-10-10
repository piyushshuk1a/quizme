import { useState, type ReactNode } from 'react';

import { type Question } from '@/containers';

import { RenderQuizContext } from './RenderQuizContext';

interface RenderQuizProviderProps {
  quizData: { questions: Question[] };
  children: ReactNode;
}

export const RenderQuizProvider: React.FC<RenderQuizProviderProps> = ({
  quizData,
  children,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({});

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) =>
      Math.min(prevIndex + 1, quizData.questions.length - 1),
    );
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  const setAnswer = (questionIndex: number, answer: string[]) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answer,
    }));
  };

  const value = {
    questions: quizData.questions,
    currentQuestionIndex,
    userAnswers,
    goToNextQuestion,
    goToPreviousQuestion,
    setAnswer,
  };

  return (
    <RenderQuizContext.Provider value={value}>
      {children}
    </RenderQuizContext.Provider>
  );
};
