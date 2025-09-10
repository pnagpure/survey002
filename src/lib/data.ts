import type { Survey, SurveyResponse } from './types';

export const surveys: Survey[] = [
  {
    id: 'product-feedback-2024',
    title: 'Product Feedback 2024',
    description: 'Help us improve our product by sharing your thoughts.',
    createdAt: '2024-05-01T10:00:00Z',
    questions: [
      {
        id: 'q1-overall-satisfaction',
        text: 'Overall, how satisfied are you with our product?',
        type: 'rating',
      },
      {
        id: 'q2-favorite-feature',
        text: 'What is your favorite feature?',
        type: 'text',
      },
      {
        id: 'q3-recommendation',
        text: 'How likely are you to recommend our product to a friend or colleague?',
        type: 'rating',
      },
      {
        id: 'q4-pricing',
        text: 'How do you feel about the pricing?',
        type: 'multiple-choice',
        options: ['Too expensive', 'Just right', 'A great value'],
      },
    ],
  },
  {
    id: 'workplace-satisfaction-q2',
    title: 'Q2 2024 Workplace Satisfaction',
    description: 'Your feedback is vital for creating a better work environment.',
    createdAt: '2024-04-15T09:00:00Z',
    questions: [
      {
        id: 'q1-work-life-balance',
        text: 'How would you rate your work-life balance?',
        type: 'rating',
      },
      {
        id: 'q2-improvement-suggestions',
        text: 'What is one thing we could do to improve your experience at work?',
        type: 'text',
      },
      {
        id: 'q3-communication',
        text: 'How effective is communication within your team?',
        type: 'multiple-choice',
        options: ['Very effective', 'Somewhat effective', 'Not effective'],
      },
    ],
  },
];

export const responses: SurveyResponse[] = [
  // Responses for Product Feedback 2024
  {
    id: 'resp1',
    surveyId: 'product-feedback-2024',
    submittedAt: '2024-05-10T14:20:10Z',
    answers: {
      'q1-overall-satisfaction': 5,
      'q2-favorite-feature': 'The real-time collaboration feature is a game-changer.',
      'q3-recommendation': 5,
      'q4-pricing': 'A great value',
    },
  },
  {
    id: 'resp2',
    surveyId: 'product-feedback-2024',
    submittedAt: '2024-05-10T15:05:30Z',
    answers: {
      'q1-overall-satisfaction': 4,
      'q2-favorite-feature': 'I love the customizable dashboards.',
      'q3-recommendation': 4,
      'q4-pricing': 'Just right',
    },
  },
  {
    id: 'resp3',
    surveyId: 'product-feedback-2024',
    submittedAt: '2024-05-11T11:00:00Z',
    answers: {
      'q1-overall-satisfaction': 3,
      'q2-favorite-feature': 'The mobile app needs more work.',
      'q3-recommendation': 3,
      'q4-pricing': 'Too expensive',
    },
  },
    {
    id: 'resp4',
    surveyId: 'product-feedback-2024',
    submittedAt: '2024-05-12T10:30:00Z',
    answers: {
      'q1-overall-satisfaction': 5,
      'q2-favorite-feature': 'The AI report generation is amazing.',
      'q3-recommendation': 5,
      'q4-pricing': 'A great value',
    },
  },

  // Responses for Workplace Satisfaction Q2
  {
    id: 'resp5',
    surveyId: 'workplace-satisfaction-q2',
    submittedAt: '2024-04-20T10:00:00Z',
    answers: {
      'q1-work-life-balance': 4,
      'q2-improvement-suggestions': 'More flexible work hours would be appreciated.',
      'q3-communication': 'Somewhat effective',
    },
  },
  {
    id: 'resp6',
    surveyId: 'workplace-satisfaction-q2',
    submittedAt: '2024-04-20T11:30:00Z',
    answers: {
      'q1-work-life-balance': 5,
      'q2-improvement-suggestions': 'Clearer career progression paths.',
      'q3-communication': 'Very effective',
    },
  },
  {
    id: 'resp7',
    surveyId: 'workplace-satisfaction-q2',
    submittedAt: '2024-04-21T09:15:00Z',
    answers: {
      'q1-work-life-balance': 2,
      'q2-improvement-suggestions': 'Fewer meetings, more focus time.',
      'q3-communication': 'Not effective',
    },
  },
];

export const getSurveyById = (id: string): Survey | undefined => {
  return surveys.find(survey => survey.id === id);
}

export const getResponsesBySurveyId = (surveyId: string): SurveyResponse[] => {
  return responses.filter(response => response.surveyId === surveyId);
}
