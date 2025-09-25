export interface Quiz {
  quizId?: string; // Firestore document ID
  title: string;
  description: string;
  complexity: 'Easy' | 'Medium' | 'Hard' | 'Advanced';
  category: string;
  isPublic: boolean;
  totalPoints: number;
  // invited: Array<{ userId: string; obtainedPoints: number }>; // sub-collection logic
  // questions: Array<Question>; // Moved to sub-collection logic
}

export interface Question {
  questionId?: string; // Firestore document ID
  questionText: string;
  questionType: 'single-select' | 'multi-select';
  points: number;
  order: number;
  options: { id: string; label: string }[];
  correctOptions: string[];
}

export interface Invited {
  userId: string;
  obtainedPoints: number;
}
