'use server';

import { z } from 'zod';
import { getResponsesBySurveyId, getSurveyById } from './data';
import { generateAISurveyReport } from '@/ai/flows/generate-ai-survey-report';
import { revalidatePath } from 'next/cache';

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
