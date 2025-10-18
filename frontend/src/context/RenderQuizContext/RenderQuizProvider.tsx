import { useState, type ReactNode } from 'react';

import { type QuizData } from '@/containers';

import { RenderQuizContext } from './RenderQuizContext';

interface RenderQuizProviderProps {
  quizData: QuizData;
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

  const { questions, ...quizInfo } = quizData;
  const value = {
    questions: questions,
    currentQuestionIndex,
    userAnswers,
    quizInfo: quizInfo,
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
