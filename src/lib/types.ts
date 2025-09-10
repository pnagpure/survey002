
export type QuestionType =
  | 'text'
  | 'multiple-choice'
  | 'rating'
  | 'number'
  | 'yesNo'
  | 'dropdown'
  | 'matrix'
  | 'date'
  | 'file'
  | 'ranking';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  // For matrix questions
  rows?: string[];
  columns?: string[];
  // For rating and number questions
  min?: number;
  max?: number;
  // For multiple choice
  multiple?: boolean;
  // For file upload
  accept?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  submittedAt: string;
  answers: Record<string, any>; // questionId -> answer, can be string, number, string[], etc.
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface SurveyCollection {
  id: string;
  name: string;
  surveyId: string;
  userIds: string[];
  schedule: string;
  status: 'active' | 'pending';
}
