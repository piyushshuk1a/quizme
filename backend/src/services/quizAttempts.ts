import admin from 'firebase-admin';

import { FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { QuizAttempt } from '@/models';

/**
 * Updates or creates a QuizAttempt document.
 * If a document with the same userId and quizId exists, it's updated.
 * Otherwise, a new document is created.
 * Only the fields provided in `updateData` will be modified.
 *
 * @param updateData - The data to update or create. Must include at least quizId and userId.
 * @returns A Promise that resolves with the updated or created document's reference.
 */
export const upsertQuizAttempt = async (
  updateData: Partial<QuizAttempt> & { quizId: string; userId: string },
) => {
  const { quizId, userId, ...dataToUpdate } = updateData;

  const quizAttemptRef = db
    .collection(FIRESTORE_COLLECTIONS.quizAttempts)
    .doc(`${userId}_${quizId}`); // Using a composite ID for simplicity

  // Prepare the data to be set/merged
  const preparedData: Partial<QuizAttempt> = {
    userId,
    quizId,
    ...dataToUpdate,
  };

  if (
    !dataToUpdate.startedAt &&
    !quizAttemptRef.get().then((doc) => doc.exists)
  ) {
    preparedData.startedAt = admin.firestore.FieldValue.serverTimestamp();
  }
  if (!dataToUpdate.status) {
    preparedData.status = 'in_progress';
  }

  await quizAttemptRef.set(preparedData, { merge: true });

  return quizAttemptRef;
};

/**
 * Fetches a specific QuizAttempt document.
 * @param userId - The ID of the user.
 * @param quizId - The ID of the quiz.
 * @returns A Promise that resolves with the QuizAttempt data, or null if not found.
 */
export const getQuizAttempt = async (
  userId: string,
  quizId: string,
): Promise<QuizAttempt | null> => {
  const quizAttemptRef = db
    .collection(FIRESTORE_COLLECTIONS.quizAttempts)
    .doc(`${userId}_${quizId}`);
  const docSnap = await quizAttemptRef.get();

  if (docSnap.exists) {
    return docSnap.data() as QuizAttempt;
  } else {
    return null;
  }
};

/**
 * Fetches all QuizAttempts for a given user.
 * @param userId - The ID of the user.
 * @returns A Promise that resolves with an array of QuizAttempt documents.
 */
export const getUserQuizAttempts = async (
  userId: string,
): Promise<QuizAttempt[]> => {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.quizAttempts)
    .where('userId', '==', userId)
    .get();

  const attempts: QuizAttempt[] = [];
  snapshot.forEach((doc) => {
    attempts.push(doc.data() as QuizAttempt);
  });

  return attempts;
};

/**
 * Fetches all QuizAttempts for a given quiz.
 * @param quizId - The ID of the quiz.
 * @returns A Promise that resolves with an array of QuizAttempt documents.
 */
export const getQuizQuizAttempts = async (
  quizId: string,
): Promise<QuizAttempt[]> => {
  const snapshot = await db
    .collection(FIRESTORE_COLLECTIONS.quizAttempts)
    .where('quizId', '==', quizId)
    .get();

  const attempts: QuizAttempt[] = [];
  snapshot.forEach((doc) => {
    attempts.push(doc.data() as QuizAttempt);
  });

  return attempts;
};
