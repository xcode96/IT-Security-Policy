export enum Topic {
  PASSWORD_SECURITY = 1,
  DATA_PROTECTION = 2,
  EMAIL_SECURITY = 3,
  DEVICE_USAGE = 4,
  PHYSICAL_SECURITY = 5,
  INCIDENT_REPORTING = 6,
  SOCIAL_ENGINEERING = 7,
  ACCEPTABLE_USE = 8,
  REMOTE_WORK = 9,
  BACKUP_RECOVERY = 10,
}

export interface Question {
  id: number;
  topicId: Topic;
  topicName: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface UserAnswer {
  questionId: number;
  topicId: Topic;
  isCorrect: boolean;
}
