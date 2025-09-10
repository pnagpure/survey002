
import type { Survey, SurveyResponse } from './types';
import type { User } from './types';

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
  {
    id: 'comprehensive-template',
    title: 'Comprehensive Survey Template',
    description: 'A template showcasing all available question types for advanced analysis.',
    createdAt: '2024-09-12T00:00:00Z',
    questions: [
      {
        id: 'q-text',
        text: 'What are your career goals for the next five years?',
        type: 'text',
      },
      {
        id: 'q-multiple-choice-single',
        text: 'Which of the following social media platforms do you use daily?',
        type: 'multiple-choice',
        multiple: false,
        options: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok'],
      },
       {
        id: 'q-multiple-choice-multi',
        text: 'Which devices do you own?',
        type: 'multiple-choice',
        multiple: true,
        options: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch'],
      },
      {
        id: 'q-rating',
        text: 'How would you rate our customer support?',
        type: 'rating',
        min: 1,
        max: 5,
      },
      {
        id: 'q-number',
        text: 'How many hours per week do you dedicate to professional development?',
        type: 'number',
        min: 0,
        max: 80,
      },
      {
        id: 'q-yesNo',
        text: 'Have you ever attended one of our company webinars?',
        type: 'yesNo',
      },
      {
        id: 'q-dropdown',
        text: 'What is your primary department?',
        type: 'dropdown',
        options: ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Support'],
      },
      {
        id: 'q-matrix',
        text: 'Please rate your satisfaction with the following aspects of your job:',
        type: 'matrix',
        rows: ['Workload', 'Compensation', 'Team Culture', 'Management'],
        columns: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
      },
      {
        id: 'q-date',
        text: 'When was your last performance review?',
        type: 'date',
      },
      {
        id: 'q-file',
        text: 'Please upload your latest project proposal document.',
        type: 'file',
        accept: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      {
        id: 'q-ranking',
        text: 'Rank the following employee benefits in order of importance (1 = most important).',
        type: 'ranking',
        options: ['Health Insurance', 'Remote Work Options', 'Paid Time Off', 'Retirement Plan'],
      },
    ],
  },
   // --- New Surveys for Each Question Type ---
  {
    id: 'text-input-survey',
    title: 'Text Input Survey: Customer Service Feedback',
    description: 'Provide detailed feedback about your experience.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-text-feedback',
        text: 'Please describe your recent experience with our customer service team.',
        type: 'text',
      },
    ],
  },
  {
    id: 'multiple-choice-survey',
    title: 'Multiple Choice Survey: Favorite Social Media',
    description: 'Help us understand your social media preferences.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-mc-platform',
        text: 'What is your most used social media platform?',
        type: 'multiple-choice',
        options: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok'],
      },
    ],
  },
  {
    id: 'rating-scale-survey',
    title: 'Rating Scale Survey: Website Usability',
    description: 'Rate your experience using our new website.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-rating-website',
        text: 'How would you rate the usability of our new website?',
        type: 'rating',
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'numerical-input-survey',
    title: 'Numerical Input Survey: Weekly Work Hours',
    description: 'Tell us about your work schedule.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-number-hours',
        text: 'How many hours do you typically work in a week?',
        type: 'number',
        min: 0,
        max: 100,
      },
    ],
  },
  {
    id: 'yes-no-survey',
    title: 'Yes/No Survey: Feature Adoption',
    description: 'A quick question about our new feature.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-yesno-feature',
        text: 'Have you used our new AI-powered reporting feature?',
        type: 'yesNo',
      },
    ],
  },
  {
    id: 'dropdown-survey',
    title: 'Dropdown Survey: Primary Device',
    description: 'Let us know your primary device for work.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-dropdown-device',
        text: 'What is your primary device for work?',
        type: 'dropdown',
        options: ['Laptop', 'Desktop', 'Tablet', 'Smartphone'],
      },
    ],
  },
  {
    id: 'matrix-survey',
    title: 'Matrix/Grid Survey: Product Satisfaction',
    description: 'Rate your satisfaction with different aspects of our product.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-matrix-product',
        text: 'Please rate your satisfaction with the following product aspects:',
        type: 'matrix',
        rows: ['Performance', 'Features', 'Design', 'Reliability'],
        columns: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
      },
    ],
  },
  {
    id: 'date-picker-survey',
    title: 'Date Picker Survey: Last Purchase Date',
    description: 'Help us understand your purchasing habits.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-date-purchase',
        text: 'When did you last purchase a product from us?',
        type: 'date',
      },
    ],
  },
  {
    id: 'file-upload-survey',
    title: 'File Upload Survey: Resume Submission',
    description: 'Submit your resume for our talent pool.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-file-resume',
        text: 'Please upload your resume in PDF format.',
        type: 'file',
        accept: 'application/pdf'
      },
    ],
  },
  {
    id: 'ranking-survey',
    title: 'Ranking Survey: Feature Priority',
    description: 'Help us prioritize which features to build next.',
    createdAt: '2024-09-15T00:00:00Z',
    questions: [
      {
        id: 'q-ranking-features',
        text: 'Rank the following features in order of importance to you (1 = most important).',
        type: 'ranking',
        options: ['Dark Mode', 'Mobile App', 'Offline Access', 'Integrations'],
      },
    ],
  },
];

export const responses: SurveyResponse[] = [
  // Responses for Product Feedback 2024
  {
    id: 'resp1',
    surveyId: 'product-feedback-2024',
    userId: 'user-1',
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
    userId: 'user-2',
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
    userId: 'user-3',
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
    userId: 'user-4',
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
    userId: 'user-2',
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
    userId: 'user-3',
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
    userId: 'user-1',
    submittedAt: '2024-04-21T09:15:00Z',
    answers: {
      'q1-work-life-balance': 2,
      'q2-improvement-suggestions': 'Fewer meetings, more focus time.',
      'q3-communication': 'Not effective',
    },
  },
  // Responses for Comprehensive Survey Template
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `c-resp${i + 1}`,
    surveyId: 'comprehensive-template',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000).toISOString(),
    answers: {
      'q-text': `My goal is to achieve a leadership position within the ${['Engineering', 'Sales', 'Marketing'][i % 3]} department.`,
      'q-multiple-choice-single': ['Facebook', 'LinkedIn', 'Instagram'][i % 3],
      'q-multiple-choice-multi': [['Smartphone', 'Laptop'], ['Tablet', 'Smartwatch'], ['Laptop'], ['Smartphone', 'Laptop', 'Tablet']][i % 4],
      'q-rating': (i % 5) + 1,
      'q-number': 5 + (i % 6),
      'q-yesNo': i % 2 === 0 ? 'Yes' : 'No',
      'q-dropdown': ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Support'][i % 5],
      'q-matrix': {
        Workload: ['Neutral', 'Satisfied', 'Very Satisfied'][i % 3],
        Compensation: ['Dissatisfied', 'Neutral', 'Satisfied'][i % 3],
        'Team Culture': ['Satisfied', 'Very Satisfied', 'Neutral'][i % 3],
        Management: ['Very Dissatisfied', 'Dissatisfied', 'Neutral'][i % 3],
      },
      'q-date': new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000), // a date in the last few months
      'q-file': `proposal_v${i + 1}.pdf`,
      'q-ranking': {
        'Health Insurance': (i % 4) + 1,
        'Remote Work Options': ((i + 1) % 4) + 1,
        'Paid Time Off': ((i + 2) % 4) + 1,
        'Retirement Plan': ((i + 3) % 4) + 1,
      },
    },
  })),

  // --- New Responses for Each Survey Type ---

  // Text Input Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `text-resp${i + 1}`,
    surveyId: 'text-input-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-text-feedback': `The support agent was ${['very helpful', 'quick to respond', 'knowledgeable', 'a bit slow', 'friendly but couldn\'t solve my issue', 'excellent', 'unhelpful', 'patient', 'efficient', 'confusing'][i]}.` },
  })),

  // Multiple Choice Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `mc-resp${i + 1}`,
    surveyId: 'multiple-choice-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-mc-platform': ['Instagram', 'TikTok', 'LinkedIn', 'Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Instagram'][i] },
  })),

  // Rating Scale Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `rating-resp${i + 1}`,
    surveyId: 'rating-scale-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-rating-website': [5, 4, 5, 3, 4, 5, 2, 4, 5, 3][i] },
  })),

  // Numerical Input Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `num-resp${i + 1}`,
    surveyId: 'numerical-input-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-number-hours': [40, 45, 38, 50, 42, 60, 35, 40, 48, 55][i] },
  })),

  // Yes/No Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `yn-resp${i + 1}`,
    surveyId: 'yes-no-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-yesno-feature': ['Yes', 'Yes', 'No', 'Yes', 'No', 'Yes', 'Yes', 'Yes', 'No', 'Yes'][i] },
  })),

  // Dropdown Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `dropdown-resp${i + 1}`,
    surveyId: 'dropdown-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-dropdown-device': ['Laptop', 'Desktop', 'Laptop', 'Tablet', 'Laptop', 'Desktop', 'Smartphone', 'Laptop', 'Tablet', 'Desktop'][i] },
  })),

  // Matrix Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `matrix-resp${i + 1}`,
    surveyId: 'matrix-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: {
      'q-matrix-product': {
        Performance: ['Satisfied', 'Very Satisfied', 'Neutral', 'Satisfied', 'Dissatisfied'][i % 5],
        Features: ['Very Satisfied', 'Satisfied', 'Satisfied', 'Neutral', 'Very Satisfied'][i % 5],
        Design: ['Neutral', 'Very Satisfied', 'Satisfied', 'Very Satisfied', 'Neutral'][i % 5],
        Reliability: ['Dissatisfied', 'Satisfied', 'Very Satisfied', 'Satisfied', 'Satisfied'][i % 5],
      },
    },
  })),

  // Date Picker Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `date-resp${i + 1}`,
    surveyId: 'date-picker-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-date-purchase': new Date(Date.now() - (i + 5) * 7 * 24 * 60 * 60 * 1000) },
  })),

  // File Upload Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `file-resp${i + 1}`,
    surveyId: 'file-upload-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: { 'q-file-resume': `resume_user_${(i % 4) + 1}_v${i + 1}.pdf` },
  })),

  // Ranking Survey Responses
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `ranking-resp${i + 1}`,
    surveyId: 'ranking-survey',
    userId: `user-${(i % 4) + 1}`,
    submittedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    answers: {
      'q-ranking-features': {
        'Dark Mode': [4, 2, 1, 3, 2, 4, 1, 3, 2, 1][i],
        'Mobile App': [1, 1, 2, 2, 1, 2, 3, 1, 3, 2][i],
        'Offline Access': [2, 3, 4, 1, 3, 1, 2, 4, 1, 4][i],
        'Integrations': [3, 4, 3, 4, 4, 3, 4, 2, 4, 3][i],
      },
    },
  })),
];

export interface SurveyCollection {
  id: string;
  name: string;
  surveyId: string;
  userIds: string[];
  schedule: string;
  status: "active" | "pending";
}

export const surveyCollections: SurveyCollection[] = [
  {
    id: "collection1",
    name: "Q3 Product Feedback",
    surveyId: "product-feedback-2024",
    userIds: ["user-1", "user-2", "user-4"],
    schedule: "2024-09-10",
    status: "active",
  },
  {
    id: "collection2",
    name: "Q2 Employee Engagement",
    surveyId: "workplace-satisfaction-q2",
    userIds: ["user-2", "user-3"],
    schedule: "2024-09-15",
    status: "pending",
  },
   {
    id: "collection3",
    name: "Alpha Testers - New Feature",
    surveyId: "product-feedback-2024",
    userIds: ["user-1", "user-3", "user-4"],
    schedule: "2024-10-01",
    status: "pending",
  },
  {
    id: "collection4",
    name: "Annual Comprehensive Review",
    surveyId: "comprehensive-template",
    userIds: ["user-1", "user-2", "user-3", "user-4"],
    schedule: "2024-11-01",
    status: "pending",
  }
];


export const getSurveyById = (id: string): Survey | undefined => {
  return surveys.find(survey => survey.id === id);
}

export const getResponsesBySurveyId = (surveyId: string): SurveyResponse[] => {
  return responses.filter(response => response.surveyId === surveyId);
}

export const getSurveyCollectionById = (id: string): SurveyCollection | undefined => {
  return surveyCollections.find(collection => collection.id === id);
}
