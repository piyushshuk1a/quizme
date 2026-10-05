import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

import { FIRESTORE_COLLECTIONS, ROLE_NAMESPACE, USER_ROLES } from '@/config';
import { db } from '@/firebase';
import { Question, Quiz } from '@/models';
import {
  createQuiz,
  getAllPublicQuizzes,
  getAllUserQuizzes,
  getInvitedQuizzesForUser,
  getQuizAttempt,
  getQuizById,
  getUserById,
  inviteCandidates,
  listInvitedCandidates,
  updateQuizAndQuestions,
  upsertQuizAttempt,
} from '@/services';
import { quizSchema, scoreQuiz } from '@/utils/quizValidation';

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

    let quizzes = {};
    if (myQuizzes) {
      quizzes = await getAllUserQuizzes(req.auth?.payload.sub as string);
    } else if (invited) {
      const user = await getUserById(req.auth?.payload.sub as string);
      quizzes = user ? await getInvitedQuizzesForUser(user.email) : [];
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
  const { value, error } = quizSchema.validate(req.body, {
    convert: false,
    stripUnknown: true,
  });
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { questions, id: bodyId, ...quizData } = value as CreateQuizBody;
  const userId = req.auth?.payload?.sub as string;
  const routeId = (req.params as { id?: string }).id;
  if (routeId && bodyId && routeId !== bodyId)
    return res.status(400).json({ message: 'Quiz ID mismatch.' });
  const id = routeId ?? bodyId;
  const isPublic = req.auth?.payload?.[ROLE_NAMESPACE] === USER_ROLES.candidate;
  try {
    let existing: Quiz | undefined;
    if (id) {
      const doc = await db
        .collection(FIRESTORE_COLLECTIONS.quizzes)
        .doc(id)
        .get();
      if (!doc.exists)
        return res.status(404).json({ message: 'Quiz not found.' });
      existing = doc.data() as Quiz;
      if (existing.publishedBy !== userId)
        return res
          .status(403)
          .json({ message: 'Only the owner can edit this quiz.' });
    }
    const finalQuizData = {
      ...quizData,
      publishedBy: userId,
      isPublic: existing?.isPublic ?? isPublic,
      totalPoints: questions.reduce((total, q) => total + q.points, 0),
      totalQuestions: questions.length,
    };
    if (id) await updateQuizAndQuestions(id, finalQuizData, questions);
    else await createQuiz(finalQuizData, questions);
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
    const quizData = await getQuizById(
      id,
      quizAttempt?.status === 'completed',
      userId,
    );

    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not found.' });
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
    if (!quizData) return res.status(404).json({ message: 'Quiz not found.' });
    if (quizAttempt?.status === 'completed')
      return res.status(409).json({ message: 'Quiz already completed.' });
    const quizAttemptData = {
      quizId: id,
      userId,
      maxPossibleScore: quizData.questions.reduce(
        (total, q) => total + q.points,
        0,
      ),
      startedAt: quizAttempt?.startedAt ?? new Date().toISOString(),
      status: 'in_progress' as const,
    };
    const attemptRef = await upsertQuizAttempt(quizAttemptData);
    const savedAttempt = (await attemptRef.get()).data();
    if (savedAttempt?.status === 'completed')
      return res.status(409).json({ message: 'Quiz already completed.' });
    return res
      .status(200)
      .json({ status: 'Ok', startedAt: savedAttempt?.startedAt });
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

    if (!quizData) return res.status(404).json({ message: 'Quiz not found.' });
    if (!quizAttempt)
      return res
        .status(409)
        .json({ message: 'Start the quiz before submitting.' });
    if (quizAttempt.status === 'completed')
      return res.status(409).json({ message: 'Quiz already completed.' });
    let result;
    try {
      result = scoreQuiz(quizData.questions as Question[], req.body?.data);
      // A small delivery grace lets the browser submit at zero; later submissions receive no credit.
      const deadline =
        Date.parse(quizAttempt.startedAt) + quizData.durationMinutes * 60000;
      if (!Number.isFinite(deadline) || Date.now() > deadline + 30000) {
        result = scoreQuiz(quizData.questions as Question[], []);
      }
    } catch {
      return res.status(400).json({ message: 'Invalid answers.' });
    }
    const quizAttemptData = {
      ...quizAttempt,
      ...result,
      quizId: id,
      userId,
      completedAt: new Date().toISOString(),
      status: 'completed' as const,
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
export const inviteCandidatesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const quizId = req.params.id;
    const quizDoc = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .get();
    if (!quizDoc.exists)
      return res.status(404).json({ message: 'Quiz not found.' });
    if (quizDoc.data()?.publishedBy !== req.auth?.payload.sub)
      return res
        .status(403)
        .json({ message: 'Only the owner can manage invitations.' });

    const { candidates } = (req.body ?? {}) as {
      candidates?: { userEmail: string }[];
    };

    if (!quizId) {
      return res.status(400).json({ message: 'quiz id is required' });
    }
    if (
      !Array.isArray(candidates) ||
      candidates.length === 0 ||
      candidates.length > 200
    ) {
      return res.status(400).json({ message: 'candidates array is required' });
    }

    // Normalize and validate emails
    const normalized = candidates
      .map((c) => ({
        userEmail: String(c?.userEmail || '')
          .trim()
          .toLowerCase(),
      }))
      .filter((c) => c.userEmail && /\S+@\S+\.\S+/.test(c.userEmail));

    if (normalized.length === 0) {
      return res
        .status(400)
        .json({ message: 'No valid email addresses provided' });
    }

    // ensure each candidate object includes quizId (matches the service's expected type)
    const candidatesWithQuizId = normalized.map((c) => ({
      userEmail: c.userEmail,
      quizId,
    }));

    await inviteCandidates(quizId, candidatesWithQuizId);

    // Try to send emails if SMTP configured
    try {
      const host = process.env.SMTP_HOST;
      const port = Number(process.env.SMTP_PORT || '587');
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      const frontendUrl = process.env.FRONTEND_URL || '';

      if (host && user && pass) {
        const transporter = nodemailer.createTransport({
          host,
          port,
          auth: { user, pass },
        });

        // Send emails in parallel
        await Promise.all(
          normalized.map(async (c) => {
            const inviteLink = frontendUrl
              ? `${frontendUrl}/quiz/${quizId}`
              : `#/quiz/${quizId}`;

            const mailOptions = {
              from: `${process.env.SMTP_FROM || 'no-reply@quizapp'} <${user}>`,
              to: c.userEmail,
              subject: 'You are invited to take a quiz',
              html: `<p>You have been invited to take a quiz. Open: <a href="${inviteLink}">${inviteLink}</a></p>`,
              text: `You have been invited to take a quiz. Open: ${inviteLink}`,
            };

            return transporter.sendMail(mailOptions);
          }),
        );
      } else {
        console.info('SMTP is not configured; invitation emails were not sent');
      }
    } catch (emailError) {
      // sending emails failed — we don't want to fail the whole request
      console.error('Error sending invitation emails:', emailError);
    }

    return res.status(200).json({ message: 'Invitations created' });
  } catch (error) {
    console.error('inviteCandidatesController error:', error);
    return res.status(500).json({ message: 'Could not create invitations' });
  }
};

export const listInvitedCandidatesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const quizId = req.params.id;
    const quizDoc = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .get();
    if (!quizDoc.exists)
      return res.status(404).json({ message: 'Quiz not found.' });
    if (quizDoc.data()?.publishedBy !== req.auth?.payload.sub)
      return res
        .status(403)
        .json({ message: 'Only the owner can manage invitations.' });

    if (!quizId) return res.status(400).json({ message: 'quiz id required' });

    const invited = await listInvitedCandidates(quizId);
    return res.status(200).json(invited);
  } catch (error) {
    console.error('listInvitedCandidatesController error:', error);
    return res
      .status(500)
      .json({ message: 'Could not fetch invited candidates' });
  }
};
