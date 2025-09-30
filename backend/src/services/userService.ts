import { FIRESTORE_COLLECTIONS } from '@/config';
import { db } from '@/firebase';
import { QuizAttempt, User } from '@/models';

const USERS_COLLECTION = FIRESTORE_COLLECTIONS.users;
const QUIZZES_ATTEMPTED_SUBCOLLECTION = FIRESTORE_COLLECTIONS.quizzesAttempted;

export const createUser = async (userData: User): Promise<User> => {
  try {
    const userDocRef = db.collection(USERS_COLLECTION).doc(userData.userId);
    await userDocRef.set(userData);
    return userData;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Could not create user.');
  }
};

export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return null;
    }

    return userDoc.data() as User;
  } catch (error) {
    console.error('Error querying a user:', error);
    throw new Error('Could not query the user');
  }
};

export const recordQuizAttempt = async (
  userId: string,
  attemptData: QuizAttempt,
): Promise<void> => {
  try {
    const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
    const quizAttemptsCollectionRef = userDocRef.collection(
      QUIZZES_ATTEMPTED_SUBCOLLECTION,
    );

    // Add a new document for this attempt
    await quizAttemptsCollectionRef.add(attemptData);
  } catch (error) {
    console.error('Error recording quiz attempt:', error);
    throw new Error('Could not record quiz attempt.');
  }
};

export const getUserQuizAttempts = async (
  userId: string,
): Promise<QuizAttempt[]> => {
  try {
    const userDocRef = db.collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return [];
    }

    const attemptsSnapshot = await userDocRef
      .collection(QUIZZES_ATTEMPTED_SUBCOLLECTION)
      .get();
    const attempts: QuizAttempt[] = [];
    attemptsSnapshot.forEach((doc) => {
      attempts.push(doc.data() as QuizAttempt);
    });

    return attempts;
  } catch (error) {
    console.error('Error fetching user and attempts:', error);
    throw new Error('Could not fetch user data.');
  }
};
