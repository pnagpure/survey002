
'use server';

import { z } from 'zod';
import { getResponsesBySurveyId, getSurveyById } from './data';
import { generateAISurveyReport } from '@/ai/flows/generate-ai-survey-report';
import { analyzeTextResponses } from '@/ai/flows/analyze-text-responses';
import { revalidatePath } from 'next/cache';
import jStat from 'jstat';
import type { Question, SurveyResponse } from '@/lib/types';


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

export async function submitResponse(surveyId: string, data: unknown) {
  // In a real app, you would validate the data against the survey's questions
  // and save it to your database.
  console.log('New response for survey', surveyId, data);
  // We'll revalidate the results page to show the new response,
  // although our mock data isn't actually updated.
  revalidatePath(`/surveys/${surveyId}/results`);

  return { success: true, message: 'Thank you for your response!' };
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
