import { Timestamp } from 'firebase/firestore'; // Assuming you're using Firebase SDK for Firestore

export interface User {
  userId: string;
  email: string;
  role: 'ADMIN' | 'CANDIDATE';
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
  profilePictureUrl?: string;
}
