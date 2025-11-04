import { useState, type ReactNode } from 'react';

import { type QuizAttempt, type QuizData } from '@/containers';

import { RenderQuizContext } from './RenderQuizContext';

interface RenderQuizProviderProps {
  quizData: QuizData & { attempt?: QuizAttempt };
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

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const setAnswer = (questionIndex: number, answer: string[]) => {
    setUserAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIndex]: answer,
    }));
  };

  const { questions, attempt, ...quizInfo } = quizData;

  const value = {
    attempt,
    questions: questions,
    currentQuestionIndex,
    userAnswers,
    quizInfo: quizInfo,
    goToNextQuestion,
    goToPreviousQuestion,
    setAnswer,
    goToQuestion,
  };

  return (
    <RenderQuizContext.Provider value={value}>
      {children}
    </RenderQuizContext.Provider>
  );
};
