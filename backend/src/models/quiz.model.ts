export type Complexity = 'Easy' | 'Medium' | 'Hard' | 'Advanced';
export type QuestionType = 'single-select' | 'multi-select';

export interface Option {
  id: string;
  label: string;
}

export interface Quiz {
  id?: string; // Firestore document ID
  title: string;
  description: string;
  complexity: Complexity;
  category: string;
  isPublic: boolean;
  totalPoints: number;
  isPublished?: boolean;
  // invited: Array<{ userId: string; obtainedPoints: number }>; // sub-collection logic
  // questions: Array<Question>; // Moved to sub-collection logic
}

export interface Question {
  questionId?: string; // Firestore document ID
  questionText: string;
  questionType: QuestionType;
  points: number;
  order: number;
  options: Option[];
  correctOptions: string[];
}

export interface Invited {
  userEmail: string;
  obtainedPoints: number;
  status: 'attempted' | 'invite_sent';
}
