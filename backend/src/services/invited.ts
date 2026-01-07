import admin from 'firebase-admin';

import { FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { Quiz } from '@/models';

const chunkArray = <T>(arr: T[], size = 10): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

export const getInvitedQuizzesForUser = async (
  userEmail: string,
): Promise<Quiz[]> => {
  try {
    const emailNormalized = String(userEmail || '')
      .trim()
      .toLowerCase();
    if (!emailNormalized) return [];

    const invitedQuizzesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.invited)
      .where('userEmail', '==', emailNormalized)
      .get();

    const quizIds: string[] = [];
    invitedQuizzesSnapshot.forEach((doc) => {
      const invitationData = doc.data();
      if (invitationData && invitationData.quizId) {
        quizIds.push(String(invitationData.quizId));
      }
    });

    if (quizIds.length === 0) {
      return [];
    }

    const uniqueQuizIds = [...new Set(quizIds)]; // Remove duplicates

    // Firestore 'in' queries accept at most 10 values — chunk and query in batches
    const chunks = chunkArray(uniqueQuizIds, 10);
    const quizMap = new Map<string, Quiz>();

    for (const chunk of chunks) {
      const quizzesSnapshot = await db
        .collection(FIRESTORE_COLLECTIONS.quizzes)
        .where(admin.firestore.FieldPath.documentId(), 'in', chunk)
        .get();

      quizzesSnapshot.forEach((doc) => {
        quizMap.set(doc.id, { id: doc.id, ...(doc.data() as Quiz) });
      });
    }

    // Preserve deterministic order by using uniqueQuizIds order
    const invitedQuizzes: Quiz[] = [];
    for (const id of uniqueQuizIds) {
      const q = quizMap.get(id);
      if (q) invitedQuizzes.push(q);
    }

    return invitedQuizzes;
  } catch (error) {
    console.error('Error fetching invited quizzes for user:', error);
    throw new Error('Could not fetch invited quizzes for user.');
  }
};
