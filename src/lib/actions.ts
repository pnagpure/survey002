

'use server';

import { z } from 'zod';
import { getResponsesBySurveyId, getSurveyById } from './data';
import { generateAISurveyReport } from '@/ai/flows/generate-ai-survey-report';
import { analyzeTextResponses } from '@/ai/flows/analyze-text-responses';
import { revalidatePath } from 'next/cache';
import jStat from 'jstat';
import type { Question, Survey, SurveyResponse, SurveyCollection, User } from '@/lib/types';
import { db } from './db';


export interface StatsResult {
  success: boolean;
  result?: {
    mean?: number;
    median?: number;
    mode?: string | number | (string | number)[];
    range?: { min: number; max: number };
    chiSquare?: {
      statistic: number;
      pValue: number;
      df: number;
      isSignificant: boolean;
      interpretation: string;
    };
    error?: string;
  };
  error?: string;
}

export async function submitResponse(surveyId: string, data: Record<string, any>) {
  try {
    const responseId = `resp_${Date.now()}`;
    const newResponse: Omit<SurveyResponse, 'id'> = {
        surveyId,
        userId: 'user-anonymous', // In a real app, this would be the logged-in user's ID
        submittedAt: new Date().toISOString(),
        answers: data,
    };

    db.responses[responseId] = newResponse;
    revalidatePath(`/surveys/${surveyId}/results`);
    revalidatePath('/dashboard');
    revalidatePath('/admin');
    return { success: true, message: 'Thank you for your response!' };
  } catch (error) {
    console.error("Error submitting response:", error);
    return { success: false, error: 'Failed to submit response.'}
  }
}

const generateReportSchema = z.object({
  surveyId: z.string(),
});

export async function generateReport(formData: FormData) {
  try {
    const { surveyId } = generateReportSchema.parse({
      surveyId: formData.get('surveyId'),
    });

    const survey = getSurveyById(surveyId);
    const responses = getResponsesBySurveyId(surveyId);

    if (!survey) {
      return { success: false, error: 'Survey not found.' };
    }

    if (responses.length === 0) {
      return { success: false, error: 'No responses yet to generate a report.' };
    }

    const result = await generateAISurveyReport({
      surveyTitle: survey.title,
      surveyDescription: survey.description,
      responses: JSON.stringify(responses.map(r => r.answers)),
    });

    return { success: true, report: result.report };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: 'Invalid input.' };
    }
    console.error(e);
    return { success: false, error: 'Failed to generate report.' };
  }
}

const analyzeTextSchema = z.object({
  question: z.string(),
  responses: z.string(),
});

export async function analyzeText(formData: FormData) {
  try {
    const { question, responses } = analyzeTextSchema.parse({
      question: formData.get('question'),
      responses: formData.get('responses'),
    });

    const result = await analyzeTextResponses({
      question,
      responses,
    });

    return { success: true, analysis: result };
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: 'Invalid input.' };
    }
    console.error(e);
    return { success: false, error: 'Failed to analyze text responses.' };
  }
}

// Descriptive stats: mean, median, mode, range (for numerical/rating/text parsed as numbers)
function computeDescriptiveStats(responses: SurveyResponse[], questionId: string): StatsResult {
  const values: number[] = responses
    .map(r => r.answers[questionId])
    .filter(val => typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val))))
    .map(val => Number(val));

  if (values.length === 0) {
    return { success: false, error: 'No valid numerical data found.' };
  }

  const mean = jStat.mean(values);
  const median = jStat.median(values);
  const mode = jStat.mode(values); // Returns array if multimodal
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = { min, max };

  return {
    success: true,
    result: { mean, median, mode, range },
  };
}

// Manual Chi-Square calculation (from observed contingency table)
function calculateChiSquare(observed: number[][]): number {
  const rows = observed.length;
  const cols = observed[0].length;
  let chiSq = 0;

  // Calculate row and column totals
  const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
  const colTotals = observed[0].map((_, col) => observed.reduce((sum, row) => sum + row[col], 0));
  const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const expected = (rowTotals[i] * colTotals[j]) / grandTotal;
      if (expected > 0) { // Avoid division by zero
        chiSq += Math.pow(observed[i][j] - expected, 2) / expected;
      }
    }
  }

  return chiSq;
}


// Chi-Square independence test
function computeChiSquare(responses: SurveyResponse[], q1: Question, q2: Question): StatsResult {
  // Extract categorical responses (assume single select; handle multi-select separately if needed)
  const contingencyTable: number[][] = []; // Rows: q1 options, Columns: q2 options

  // Get unique categories for q1 and q2
  const q1Cats = q1.options || ['Yes', 'No']; // Fallback for yesNo
  const q2Cats = q2.options || ['Yes', 'No'];
  const table = Array.from({ length: q1Cats.length }, () => Array(q2Cats.length).fill(0));

  responses.forEach(r => {
    const ans1 = r.answers[q1.id];
    const ans2 = r.answers[q2.id];
    if (ans1 && ans2 && typeof ans1 === 'string' && typeof ans2 === 'string') {
      const idx1 = q1Cats.indexOf(ans1);
      const idx2 = q2Cats.indexOf(ans2);
      if (idx1 >= 0 && idx2 >= 0) {
        table[idx1][idx2]++;
      }
    }
  });

  const chiSq = calculateChiSquare(table);
  const df = (q1Cats.length - 1) * (q2Cats.length - 1);
  const pValue = 1 - jStat.chisquare.cdf(chiSq, df); // CDF from jStat
  const isSignificant = pValue < 0.05;
  const interpretation = isSignificant 
    ? `There is a statistically significant association between "${q1.text}" and "${q2.text}".`
    : `There is no statistically significant association between "${q1.text}" and "${q2.text}".`;

  return {
    success: true,
    result: {
      chiSquare: { statistic: chiSq, pValue, df, isSignificant, interpretation },
    },
  };
}


export async function runStatisticalTest(data: {
  testType: 'descriptive' | 'chi-square';
  questionId?: string; // For descriptive (single question)
  question1?: Question; // For Chi-Square
  question2?: Question;
  responses: SurveyResponse[];
}): Promise<StatsResult> {
  try {
    const { testType, questionId, question1, question2, responses } = data;

    if (testType === 'descriptive') {
      if (!questionId) {
        return { success: false, error: 'Question ID required for descriptive stats.' };
      }
      return computeDescriptiveStats(responses, questionId);
    }

    if (testType === 'chi-square') {
      if (!question1 || !question2) {
        return { success: false, error: 'Two questions required for Chi-Square.' };
      }
      if (!['multiple-choice', 'yesNo', 'dropdown'].includes(question1.type) || !['multiple-choice', 'yesNo', 'dropdown'].includes(question2.type)) {
        return { success: false, error: 'Chi-Square requires categorical questions.' };
      }
      return computeChiSquare(responses, question1, question2);
    }

    return { success: false, error: 'Invalid test type.' };
  } catch (error) {
    console.error('Stats computation error:', error);
    return { success: false, error: 'Computation failed.' };
  }
}

export async function createSurvey(data: { title: string, description: string, questions: Question[]}) {
    try {
        const { title, description, questions } = data;
        const surveyId = title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();

        const newSurvey: Omit<Survey, 'id'> = {
            title,
            description,
            questions,
            createdAt: new Date().toISOString(),
        };

        db.surveys[surveyId] = newSurvey;
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error creating survey:", error);
        return { success: false, error: "Failed to create survey." };
    }
}

export async function createCollection(data: {
    name: string;
    surveyId: string;
    schedule: string;
    cohortType?: 'organisation' | 'university' | 'government' | 'general';
    logoDataUri?: string;
    sponsorMessage?: string;
    sponsorSignature?: string;
    respondents: {id: string, name: string, email: string}[];
    superUsers: {id: string, name: string, email: string}[];
}) {
    try {
        const { name, surveyId, schedule, respondents, superUsers, ...rest } = data;
        
        // Add users to global user table if they don't exist
        const respondentIds = respondents.map(u => {
            if (!db.users[u.id]) { db.users[u.id] = { name: u.name, email: u.email }; }
            return u.id;
        });
        const superUserIds = superUsers.map(u => {
             if (!db.users[u.id]) { db.users[u.id] = { name: u.name, email: u.email }; }
            return u.id;
        });

        const collectionId = `coll-${Date.now()}`;
        const newCollection: Omit<SurveyCollection, 'id'> = {
            name,
            surveyId,
            schedule,
            userIds: respondentIds,
            superUserIds: superUserIds,
            status: new Date(schedule) <= new Date() ? 'active' : 'pending',
            ...rest,
        };

        db.surveyCollections[collectionId] = newCollection;
        revalidatePath('/admin');
        return { success: true };
    } catch(error) {
        console.error("Error creating collection:", error);
        return { success: false, error: "Failed to create collection." };
    }
}

export async function updateCollection(collectionId: string, data: {
    cohortType?: 'organisation' | 'university' | 'government' | 'general';
    logoDataUri?: string;
    sponsorMessage?: string;
    sponsorSignature?: string;
    respondents: {id: string, name: string, email: string}[];
    superUsers: {id: string, name: string, email: string}[];
}) {
    try {
        const collection = db.surveyCollections[collectionId];
        if (!collection) {
            return { success: false, error: 'Collection not found.' };
        }

        const { respondents, superUsers, ...rest } = data;
        const respondentIds = respondents.map(u => {
            if (!db.users[u.id]) { db.users[u.id] = { name: u.name, email: u.email }; }
            return u.id;
        });
        const superUserIds = superUsers.map(u => {
             if (!db.users[u.id]) { db.users[u.id] = { name: u.name, email: u.email }; }
            return u.id;
        });

        const updatedCollection: Omit<SurveyCollection, 'id'> = {
            ...collection,
            ...rest,
            userIds: respondentIds,
            superUserIds: superUserIds,
        };
        
        db.surveyCollections[collectionId] = updatedCollection;
        revalidatePath(`/admin/collections/edit/${collectionId}`);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error updating collection:", error);
        return { success: false, error: "Failed to update collection." };
    }
}


export async function updateCollectionContent(collectionId: string, data: { sponsorMessage?: string; sponsorSignature?: string; }) {
     try {
        const collection = db.surveyCollections[collectionId];
        if (!collection) {
            return { success: false, error: 'Collection not found.' };
        }
        collection.sponsorMessage = data.sponsorMessage;
        collection.sponsorSignature = data.sponsorSignature;

        revalidatePath(`/admin/collections/${collectionId}/preview`);
        return { success: true };
    } catch (error) {
        console.error("Error updating collection content:", error);
        return { success: false, error: "Failed to save content." };
    }
}


export async function sendSurvey(collectionId: string) {
    try {
        const collection = db.surveyCollections[collectionId];
        if (!collection) {
            return { success: false, error: 'Collection not found.' };
        }
        collection.status = 'active';
        console.log(`Simulating sending survey for collection "${collection.name}"`);
        console.log(`From: info@qlsystems.in`);
        console.log(`Recipients: ${collection.userIds.length} users`);
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error sending survey:", error);
        return { success: false, error: "Failed to send survey." };
    }
}


export async function addUser(user: { name: string; email: string }) {
    try {
        const userId = `user-${Date.now()}`;
        db.users[userId] = user;
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to add user.' };
    }
}

export async function deleteUser(userId: string) {
    try {
        if (!db.users[userId]) {
             return { success: false, error: 'User not found.' };
        }
        delete db.users[userId];
        // Also remove user from collections (optional, good practice)
        Object.values(db.surveyCollections).forEach(coll => {
            coll.userIds = coll.userIds.filter(id => id !== userId);
            coll.superUserIds = coll.superUserIds.filter(id => id !== userId);
        });

        revalidatePath('/admin/users');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete user.' };
    }
}

    