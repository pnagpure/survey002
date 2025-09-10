
export type QuestionType = 'text' | 'multiple-choice' | 'rating';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
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
  submittedAt: string;
  answers: Record<string, string | number>; // questionId -> answer
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
