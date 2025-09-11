/**
 * @fileoverview
 * This file simulates a Firestore database structure for local development.
 * It exports "collections" as JavaScript objects, where keys are document IDs.
 */

import type { Survey, SurveyResponse, SurveyCollection, User } from './types';

// Note: In Firestore, we wouldn't store the 'id' field inside the document itself,
// as the document ID serves that purpose. We Omit 'id' from the value types.

export const db = {
  surveys: {
    'product-feedback-2024': {
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
    'workplace-satisfaction-q2': {
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
    'comprehensive-template': {
      title: 'Comprehensive Survey Template',
      description: 'A template showcasing all available question types for advanced analysis.',
      createdAt: '2024-09-12T00:00:00Z',
      questions: [
        { id: 'q-text', text: 'What are your career goals for the next five years?', type: 'text' },
        { id: 'q-multiple-choice-single', text: 'Which of the following social media platforms do you use daily?', type: 'multiple-choice', multiple: false, options: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok'] },
        { id: 'q-multiple-choice-multi', text: 'Which devices do you own?', type: 'multiple-choice', multiple: true, options: ['Smartphone', 'Laptop', 'Tablet', 'Smartwatch'] },
        { id: 'q-rating', text: 'How would you rate our customer support?', type: 'rating', min: 1, max: 5 },
        { id: 'q-number', text: 'How many hours per week do you dedicate to professional development?', type: 'number', min: 0, max: 80 },
        { id: 'q-yesNo', text: 'Have you ever attended one of our company webinars?', type: 'yesNo' },
        { id: 'q-dropdown', text: 'What is your primary department?', type: 'dropdown', options: ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Support'] },
        { id: 'q-matrix', text: 'Please rate your satisfaction with the following aspects of your job:', type: 'matrix', rows: ['Workload', 'Compensation', 'Team Culture', 'Management'], columns: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] },
        { id: 'q-date', text: 'When was your last performance review?', type: 'date' },
        { id: 'q-file', text: 'Please upload your latest project proposal document.', type: 'file', accept: 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { id: 'q-ranking', text: 'Rank the following employee benefits in order of importance (1 = most important).', type: 'ranking', options: ['Health Insurance', 'Remote Work Options', 'Paid Time Off', 'Retirement Plan'] },
      ],
    },
  } as Record<string, Omit<Survey, 'id'>>,
  responses: {
    'resp1': { surveyId: 'product-feedback-2024', userId: 'user-1', submittedAt: '2024-05-10T14:20:10Z', answers: { 'q1-overall-satisfaction': 5, 'q2-favorite-feature': 'The real-time collaboration feature is a game-changer.', 'q3-recommendation': 5, 'q4-pricing': 'A great value' } },
    'resp2': { surveyId: 'product-feedback-2024', userId: 'user-2', submittedAt: '2024-05-10T15:05:30Z', answers: { 'q1-overall-satisfaction': 4, 'q2-favorite-feature': 'I love the customizable dashboards.', 'q3-recommendation': 4, 'q4-pricing': 'Just right' } },
    'resp3': { surveyId: 'product-feedback-2024', userId: 'user-3', submittedAt: '2024-05-11T11:00:00Z', answers: { 'q1-overall-satisfaction': 3, 'q2-favorite-feature': 'The mobile app needs more work.', 'q3-recommendation': 3, 'q4-pricing': 'Too expensive' } },
    'resp4': { surveyId: 'product-feedback-2024', userId: 'user-4', submittedAt: '2024-05-12T10:30:00Z', answers: { 'q1-overall-satisfaction': 5, 'q2-favorite-feature': 'The AI report generation is amazing.', 'q3-recommendation': 5, 'q4-pricing': 'A great value' } },
    'resp5': { surveyId: 'workplace-satisfaction-q2', userId: 'user-2', submittedAt: '2024-04-20T10:00:00Z', answers: { 'q1-work-life-balance': 4, 'q2-improvement-suggestions': 'More flexible work hours would be appreciated.', 'q3-communication': 'Somewhat effective' } },
    'resp6': { surveyId: 'workplace-satisfaction-q2', userId: 'user-3', submittedAt: '2024-04-20T11:30:00Z', answers: { 'q1-work-life-balance': 5, 'q2-improvement-suggestions': 'Clearer career progression paths.', 'q3-communication': 'Very effective' } },
    'resp7': { surveyId: 'workplace-satisfaction-q2', userId: 'user-1', submittedAt: '2024-04-21T09:15:00Z', answers: { 'q1-work-life-balance': 2, 'q2-improvement-suggestions': 'Fewer meetings, more focus time.', 'q3-communication': 'Not effective' } },
    ...Array.from({ length: 10 }, (_, i) => ({
        [`c-resp${i + 1}`]: {
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
                'q-matrix': { Workload: ['Neutral', 'Satisfied', 'Very Satisfied'][i % 3], Compensation: ['Dissatisfied', 'Neutral', 'Satisfied'][i % 3], 'Team Culture': ['Satisfied', 'Very Satisfied', 'Neutral'][i % 3], Management: ['Very Dissatisfied', 'Dissatisfied', 'Neutral'][i % 3] },
                'q-date': new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000),
                'q-file': `proposal_v${i + 1}.pdf`,
                'q-ranking': { 'Health Insurance': (i % 4) + 1, 'Remote Work Options': ((i + 1) % 4) + 1, 'Paid Time Off': ((i + 2) % 4) + 1, 'Retirement Plan': ((i + 3) % 4) + 1 },
            },
        }
    })).reduce((acc, obj) => ({...acc, ...obj}), {})
  } as Record<string, Omit<SurveyResponse, 'id'>>,
  surveyCollections: {
    "collection1": { name: "Q3 Product Feedback", surveyId: "product-feedback-2024", userIds: ["user-1", "user-2", "user-4"], superUserIds: ["user-3"], schedule: "2024-09-10", status: "active", cohortType: 'organisation', logoDataUri: '', sponsorMessage: 'Your feedback is crucial in helping us improve. We appreciate you taking the time to share your thoughts.', sponsorSignature: 'Jane Doe, Head of Product' },
    "collection2": { name: "Q2 Employee Engagement", surveyId: "workplace-satisfaction-q2", userIds: ["user-2", "user-3"], superUserIds: ["user-1"], schedule: "2024-09-15", status: "pending", cohortType: 'general' },
    "collection3": { name: "Alpha Testers - New Feature", surveyId: "product-feedback-2024", userIds: ["user-1", "user-3", "user-4"], superUserIds: ["user-2"], schedule: "2024-10-01", status: "pending", cohortType: 'government' },
    "collection4": { name: "Annual Comprehensive Review", surveyId: "comprehensive-template", userIds: ["user-1", "user-2", "user-3", "user-4"], superUserIds: [], schedule: "2024-11-01", status: "pending", cohortType: 'university' }
  } as Record<string, Omit<SurveyCollection, 'id'>>,
  users: {
    'user-1': { name: 'Alice Johnson', email: 'alice.j@example.com' },
    'user-2': { name: 'Bob Williams', email: 'bob.w@example.com' },
    'user-3': { name: 'Charlie Brown', email: 'charlie.b@example.com' },
    'user-4': { name: 'Diana Prince', email: 'diana.p@example.com' }
  } as Record<string, Omit<User, 'id'>>,
};
