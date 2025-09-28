export interface Question {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  id: string;
  name: string;
  questions: Question[];
}

export interface UserAnswer {
  questionId: number;
  isCorrect: boolean;
  questionText: string;
}

export interface QuizProgress {
  [quizId: string]: {
    status: 'not_started' | 'in_progress' | 'completed';
    score: number;
    total: number;
    userAnswers: UserAnswer[];
  };
}

export interface TrainingReport {
    id: string;
    user: { fullName: string, username: string };
    quizProgress: QuizProgress;
    overallResult: boolean;
    submissionDate: string;
}

export interface User {
  fullName: string;
  username: string; // This is the user's login ID
  password: string;
  status: 'active' | 'expired';
}

export interface RetakeRequest {
  username: string;
  fullName: string;
  requestDate: string;
}

export type AdminRole = 'super' | 'editor' | 'viewer';

export interface AdminUser {
  username: string;
  password: string;
  role: AdminRole;
}

export interface AdminPanelProps {
    quizzes: Quiz[];
    users: User[];
    adminUsers: AdminUser[];
    admin: AdminUser; // The currently logged-in admin
    onAddUser: (user: Omit<User, 'status'>) => boolean;
    onDeleteUser: (username: string) => void;
    onAddQuestion: (quizId: string, question: Omit<Question, 'id'>) => void;
    onEditQuestion: (quizId: string, updatedQuestion: Question) => void;
    onDeleteQuestion: (quizId: string, questionId: number) => void;
    onImportQuizzes: (quizzes: Quiz[]) => void;
    onUpdateRequestStatus: (username: string, status: 'active' | 'expired') => Promise<void>;
    onAddAdmin: (admin: AdminUser) => boolean;
    onDeleteAdmin: (username: string) => void;
}