import { FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { Invited, Question, Quiz } from '@/models';

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

    // 3. Return the created quiz with its ID
    return { ...quizData, id: quizDocRef.id };
  } catch (error) {
    console.error('Error creating quiz:', error);
    throw new Error('Could not create quiz.');
  }
};

export const getQuizById = async (quizId: string): Promise<Quiz | null> => {
  try {
    const quizDocRef = db.collection(FIRESTORE_COLLECTIONS.quizzes).doc(quizId);
    const quizDoc = await quizDocRef.get();

    if (!quizDoc.exists) {
      return null;
    }

    return { id: quizDoc.id, ...(quizDoc.data() as Quiz) };
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw new Error('Could not fetch quiz.');
  }
};

export const getAllUserQuizzes = async (id: string): Promise<Quiz[]> => {
  try {
    // Perform the database query
    const querySnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .where('publishedBy', '==', id)
      .get();

    // Map the documents to a clean array of data
    const quizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Quiz),
    }));

    return quizzes;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    // You might want to throw the error or return a specific error object
    throw new Error('Could not retrieve quizzes.');
  }
};

export const getAllPublicQuizzes = async (): Promise<Quiz[]> => {
  try {
    const quizzesSnapshot = await db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .where('isPublic', '==', true)
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
  candidates: Omit<Invited, 'obtainedPoints' | 'status'>[],
): Promise<void> => {
  try {
    const batch = db.batch();
    const invitedCollectionRef = db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .collection(FIRESTORE_COLLECTIONS.invited);

    for (const candidate of candidates) {
      const candidateDocRef = invitedCollectionRef.doc();
      batch.set(candidateDocRef, {
        ...candidate,
        obtainedPoints: 0,
        status: 'invite_sent',
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error inviting candidates:', error);
    throw new Error('Could not invite candidates.');
  }
};

export const updateInvitedCandidate = async (
  quizId: string,
  userId: string,
  updateData: Partial<Invited>,
): Promise<void> => {
  try {
    const invitedDocRef = db
      .collection(FIRESTORE_COLLECTIONS.quizzes)
      .doc(quizId)
      .collection(FIRESTORE_COLLECTIONS.invited)
      .doc(userId);

    await invitedDocRef.update(updateData);
  } catch (error) {
    console.error('Error updating invited candidate:', error);
    throw new Error('Could not update invited candidate.');
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
      invitedCandidates.push(doc.data() as Invited);
    });

    return invitedCandidates;
  } catch (error) {
    console.error('Error listing invited candidates:', error);
    throw new Error('Could not list invited candidates.');
  }
};
