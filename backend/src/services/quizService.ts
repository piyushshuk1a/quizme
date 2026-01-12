import admin from 'firebase-admin';

import { FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { Invited, Question, Quiz } from '@/models';
import {
  getInviteSafeId,
  getGlobalInviteDocId,
  normalizeEmail,
} from '@/utils/inviteUtils';

export const createQuiz = async (
  quizData: Quiz,
  questions: Question[],
): Promise<Quiz> => {
  try {
    const quizDocRef = db.collection(FIRESTORE_COLLECTIONS.quizzes).doc();
    await quizDocRef.set(quizData);

    const batch = db.batch();
    const questionsCollectionRef = quizDocRef.collection(
      FIRESTORE_COLLECTIONS.questions,
    );

    for (const question of questions) {
      const newQuestionRef = questionsCollectionRef.doc();
      batch.set(newQuestionRef, question);
    }
    await batch.commit();

    // Return the created quiz with its ID
    return { ...quizData, id: quizDocRef.id };
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw new Error('Could not create quiz.');
  }
};
export const updateQuizAndQuestions = async (
  quizId: string,
  updatedQuizData: Quiz,
  updatedQuestions: Question[],
) => {
  const quizRef = db.collection(FIRESTORE_COLLECTIONS.quizzes).doc(quizId);

  try {
    // 1) Ensure quiz exists
    const quizDoc = await quizRef.get();
    if (!quizDoc.exists) {
      throw new Error(`Quiz with ID ${quizId} not found.`);
    }

    // 2) Prepare a batch to atomically update the quiz and its questions
    const batch = db.batch();

    // Update main quiz document
    const quizUpdatePayload = { ...updatedQuizData };
    batch.update(quizRef, quizUpdatePayload);

    // Delete existing questions
    const questionsRef = quizRef.collection(FIRESTORE_COLLECTIONS.questions);
    const existingQuestionsSnapshot = await questionsRef.get();
    existingQuestionsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Add new questions with generated IDs
    for (const question of updatedQuestions) {
      const newQuestionRef = questionsRef.doc();
      batch.set(newQuestionRef, question);
    }

    // Commit the whole set of operations
    await batch.commit();
  } catch (error) {
    console.error(`Error updating quiz ${quizId}:`, error);
    throw new Error(`Failed to update quiz ${quizId}.`);
  }
};

type WithOrWithoutAnswers = PartialBy<Question, 'correctOptions'>;
type QuizDataTransformed = Quiz & { questions: WithOrWithoutAnswers[] } & {
  publishedByName?: string;
};
export const getQuizById = async (
  quizId: string,
  includeAnswers: boolean,
  userId: string,
): Promise<QuizDataTransformed | null> => {
  try {
    const quizDocRef = db.collection(FIRESTORE_COLLECTIONS.quizzes).doc(quizId);
    const quizDoc = await quizDocRef.get();

    if (!quizDoc.exists) {
      console.warn(`Quiz with ID "${quizId}" not found.`);
      return null;
    }

    // Fetch questions from the 'questions' sub-collection
    const questionsCollectionRef = quizDocRef.collection(
      FIRESTORE_COLLECTIONS.questions,
    );
    const questionsQuerySnapshot = await questionsCollectionRef
      .orderBy('order')
      .get();

    const quizDocData = {
      id: quizDoc.id,
      ...(quizDoc.data() as Quiz),
    };
    const questions: WithOrWithoutAnswers[] = [];
    questionsQuerySnapshot.forEach((doc) => {
      const { correctOptions, ...restQData } = doc.data() as Question;
      const includeCorrectOptions =
        includeAnswers || userId === quizDocData.publishedBy;
      questions.push({
        ...restQData,
        ...(includeCorrectOptions && { correctOptions }),
      });
    });

    // Combine quiz data and questions
    const quizData: QuizDataTransformed = {
      ...quizDocData,
      questions,
    };

    // Fetch publisher name (if present)
    const userRef = db
      .collection(FIRESTORE_COLLECTIONS.users)
      .doc(quizData.publishedBy);
    const userDoc = await userRef.get();
    const userData = userDoc.data() as
      | { firstName?: string; lastName?: string }
      | undefined;

    if (userData) {
      quizData.publishedByName =
        `${userData.firstName ?? ''} ${userData.lastName ?? ''}`.trim() ||
        quizData.publishedBy;
    }

    return quizData;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw new Error('Could not fetch quiz.');
  }
};

export const getAllUserQuizzes = async (id: string): Promise<Quiz[]> => {
  try {
    const querySnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .where('publishedBy', '==', id)
      .get();

    const quizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Quiz),
    }));

    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw new Error('Could not retrieve quizzes.');
  }
};

export const getAllPublicQuizzes = async (
  currentUser?: string,
): Promise<Quiz[]> => {
  try {
    const quizzesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .where('isPublic', '==', true)
      .where('publishedBy', '!=', currentUser ?? '')
      .get();

    const quizzes: Quiz[] = [];
    quizzesSnapshot.forEach((doc) => {
      quizzes.push({ id: doc.id, ...(doc.data() as Quiz) });
    });

    return quizzes;
  } catch (error) {
    console.error('Error fetching public quizzes:', error);
    throw new Error('Could not fetch quizzes.');
  }
};

export const inviteCandidates = async (
  quizId: string,
  candidates: { userEmail: string; quizId?: string }[],
): Promise<void> => {
  try {
    if (!quizId) throw new Error('quizId required');
    if (!Array.isArray(candidates) || candidates.length === 0) return;

    const batch = db.batch();
    const quizDocRef = db.collection(FIRESTORE_COLLECTIONS.quizzes).doc(quizId);

    for (const cand of candidates) {
      const emailNormalized = normalizeEmail(cand.userEmail);
      if (!emailNormalized) continue;

      // deterministic id to avoid duplicates
      const safeId = getInviteSafeId(emailNormalized);

      // per-quiz invited subcollection doc
      const perQuizRef = quizDocRef
        .collection(FIRESTORE_COLLECTIONS.invited)
        .doc(safeId);
      const perQuizData: admin.firestore.DocumentData = {
        userEmail: emailNormalized,
        quizId,
        status: 'invite_sent',
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(perQuizRef, perQuizData, { merge: true });

      // global invited collection (for lookup by user email)
      const globalId = getGlobalInviteDocId(quizId, emailNormalized);
      const globalRef = db
        .collection(FIRESTORE_COLLECTIONS.invited)
        .doc(globalId);
      const globalData: admin.firestore.DocumentData = {
        userEmail: emailNormalized,
        quizId,
        status: 'invite_sent',
        invitedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      batch.set(globalRef, globalData, { merge: true });
    }

    await batch.commit();
  } catch (err) {
    console.error('inviteCandidates service error', err);
    throw err;
  }
};

export const updateInvitedCandidate = async (
  quizId: string,
  userEmail: string,
  updates: Partial<Invited>,
): Promise<void> => {
  try {
    if (!quizId) throw new Error('quizId required');
    const emailNormalized = normalizeEmail(userEmail);
    if (!emailNormalized) throw new Error('invalid email');

    const safeId = getInviteSafeId(emailNormalized);

    const perQuizRef = db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .collection(FIRESTORE_COLLECTIONS.invited)
      .doc(safeId);

    const globalRef = db
      .collection(FIRESTORE_COLLECTIONS.invited)
      .doc(getGlobalInviteDocId(quizId, emailNormalized));

    const batch = db.batch();

    const payload: admin.firestore.DocumentData = {
      ...updates,
      userEmail: emailNormalized,
      quizId,
      invitedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.set(perQuizRef, payload, { merge: true });
    batch.set(globalRef, payload, { merge: true });

    await batch.commit();
  } catch (err) {
    console.error('updateInvitedCandidate error', err);
    throw err;
  }
};

export const listInvitedCandidates = async (
  quizId: string,
): Promise<Invited[]> => {
  try {
    const invitedCollectionRef = db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .collection(FIRESTORE_COLLECTIONS.invited);
    const invitedSnapshot = await invitedCollectionRef.get();

    const invitedCandidates: Invited[] = [];
    invitedSnapshot.forEach((doc) => {
      invitedCandidates.push({ id: doc.id, ...(doc.data() as Invited) });
    });

    return invitedCandidates;
  } catch (error) {
    console.error('Error listing invited candidates:', error);
    throw new Error('Could not list invited candidates.');
  }
};
