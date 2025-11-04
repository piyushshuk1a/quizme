import { Request, Response } from 'express';

import { FIRESTORE_COLLECTIONS, ROLE_NAMESPACE, USER_ROLES } from '@/config';
import { db } from '@/firebase';
import { Question } from '@/models';
import {
  createQuiz,
  getAllPublicQuizzes,
  getAllUserQuizzes,
  getInvitedQuizzesForUser,
  getQuizAttempt,
  getQuizById,
  updateQuizAndQuestions,
  upsertQuizAttempt,
} from '@/services';

import {
  CreateQuizBody,
  GetAllQuizzesQueryParams,
} from './quizController.types';

export const getAllPublicQuizzesController = async (
  req: Request<unknown, unknown, GetAllQuizzesQueryParams>,
  res: Response,
) => {
  try {
    const myQuizzes = req.query.myQuizzes === 'true';
    const invited = req.query.invited === 'true';

    if ((myQuizzes || invited) && !req.auth?.payload?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (invited && !req.query.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    let quizzes = {};
    if (myQuizzes) {
      quizzes = await getAllUserQuizzes(req.auth?.payload.sub as string);
    } else if (invited) {
      quizzes = await getInvitedQuizzesForUser(req.query.email as string);
    } else {
      quizzes = await getAllPublicQuizzes(req.auth?.payload?.sub);
    }

    return res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching public quizzes:', error);
    return res.status(500).json({ message: 'Could not fetch quizzes.' });
  }
};

export const createQuizController = async (
  req: Request<unknown, unknown, CreateQuizBody>,
  res: Response,
) => {
  const { questions, ...quizData } = req.body;
  const userId = req.auth?.payload?.sub as string;
  const isPublic = req.auth?.payload?.[ROLE_NAMESPACE] === USER_ROLES.candidate;
  const totalQuestions = questions.length;

  let totalPoints = 0;
  for (const q of questions) totalPoints += q.points;

  const finalQuizData = {
    ...quizData,
    publishedBy: userId,
    isPublic,
    totalPoints,
    totalQuestions,
  };

  try {
    let exist = false;

    // Check if quiz exist
    if (finalQuizData.id) {
      const quizDocRef = db
        .collection(FIRESTORE_COLLECTIONS.quizzes)
        .doc(finalQuizData.id);
      const quizDoc = await quizDocRef.get();
      exist = quizDoc.exists;
    }

    // If quiz exist, update the data, otherwise add new
    if (exist) {
      updateQuizAndQuestions(
        finalQuizData.id as string,
        finalQuizData,
        questions,
      );
    } else
      await createQuiz(
        {
          ...quizData,
          publishedBy: userId,
          isPublic,
          totalPoints,
          totalQuestions,
        },
        questions,
      );

    return res.status(200).json({ status: 'Success' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQuizByIdController = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const id = req.params.id;
  const userId = req.auth?.payload?.sub as string;

  try {
    const quizAttempt = await getQuizAttempt(userId, id);
    const quizData = await getQuizById(id, !!quizAttempt, userId);

    if (!quizData) {
      return res.status(200).send({});
    }

    return res.status(200).json(quizData);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal Server Error ' });
  }
};

export const startQuizController = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.auth?.payload?.sub as string;

  try {
    const quizAttempt = await getQuizAttempt(userId, id);
    const quizData = await getQuizById(id, true, userId);
    const quizAttemptData = {
      quizId: id,
      userId: userId,
      maxPossibleScore: quizData?.questions.reduce(
        (maxScore, curr) => curr.points + maxScore,
        0,
      ),
      startedAt: new Date().toUTCString(),
      status: 'in_progress' as const,
      ...(quizAttempt ?? {}),
    };
    await upsertQuizAttempt(quizAttemptData);

    return res.status(200).json({ status: 'Ok' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const submitQuizController = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.auth?.payload?.sub as string;

  try {
    const quizAttempt = await getQuizAttempt(userId, id);
    const quizData = await getQuizById(id, true, userId);

    if (!req.body.data)
      return res.status(400).json({ message: 'Invalid Request' });

    const answers = req.body.data as {
      order: number;
      selectedOptions: string[];
    }[];

    if (!quizData) return res.status(400).json({ message: 'Quiz not found' });

    const correctAnswers: Record<
      number,
      { correctOptions: string[]; points: number }
    > = {}; // map between order and correct options

    for (const quest of quizData.questions) {
      const { order, correctOptions, points } = quest as Question;
      correctAnswers[order] = { correctOptions, points };
    }

    const answerData: {
      order: number;
      selectedOptions: string[];
      isCorrect: boolean;
    }[] = [];
    let score = 0;
    const maxPossibleScore = quizData?.questions.reduce(
      (maxScore, curr) => curr.points + maxScore,
      0,
    );
    for (const ans of answers) {
      const { order, selectedOptions } = ans;
      const correctOptions = correctAnswers[order].correctOptions;

      if (
        correctOptions.length === selectedOptions.length &&
        correctOptions.every((option) => selectedOptions.includes(option))
      ) {
        score += correctAnswers[order].points;
        answerData.push({ order, selectedOptions, isCorrect: true });
      } else answerData.push({ order, selectedOptions, isCorrect: false });
    }

    const quizAttemptData = {
      ...(quizAttempt ?? {}),
      quizId: id,
      userId: userId,
      maxPossibleScore,
      score,
      percentage: Math.trunc((score / maxPossibleScore) * 100),
      completedAt: new Date().toUTCString(),
      status: 'completed' as const,
      answers: answerData,
    };
    await upsertQuizAttempt(quizAttemptData);

    return res.status(200).json({ status: 'Ok' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getQuizAttemptController = async (req: Request, res: Response) => {
  const id = req.params.id;
  const userId = req.auth?.payload?.sub as string;

  try {
    const quizAttempt = await getQuizAttempt(userId, id);

    return res.status(200).json(quizAttempt ?? {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
