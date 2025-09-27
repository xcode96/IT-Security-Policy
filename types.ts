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
  username: string; // This is the Employee ID
  password: string;
  status: 'active' | 'expired';
}

export interface AdminPanelProps {
    quizzes: Quiz[];
    users: User[];
    onAddUser: (user: Omit<User, 'status'>) => boolean;
    onDeleteUser: (username: string) => void;
    onAddQuestion: (quizId: string, question: Omit<Question, 'id'>) => void;
    onImportQuizzes: (quizzes: Quiz[]) => void;
}