'use server';
/**
 * @fileOverview AI-powered survey report generator.
 *
 * - generateAISurveyReport - A function that generates a summary report of survey results using AI.
 * - GenerateAISurveyReportInput - The input type for the generateAISurveyReport function.
 * - GenerateAISurveyReportOutput - The return type for the generateAISurveyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAISurveyReportInputSchema = z.object({
  surveyTitle: z.string().describe('The title of the survey.'),
  surveyDescription: z.string().describe('A description of the survey.'),
  responses: z
    .string()
    .describe(
      'A stringified JSON array containing the survey responses. Each object in the array represents a single response.'
    ),
});

export type GenerateAISurveyReportInput = z.infer<
  typeof GenerateAISurveyReportInputSchema
>;

const GenerateAISurveyReportOutputSchema = z.object({
  report: z.string().describe('The AI-generated summary report of the survey.'),
});

export type GenerateAISurveyReportOutput = z.infer<
  typeof GenerateAISurveyReportOutputSchema
>;

export async function generateAISurveyReport(
  input: GenerateAISurveyReportInput
): Promise<GenerateAISurveyReportOutput> {
  return generateAISurveyReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAISurveyReportPrompt',
  input: {schema: GenerateAISurveyReportInputSchema},
  output: {schema: GenerateAISurveyReportOutputSchema},
  prompt: `You are an expert survey analyst. You will analyze the survey responses and generate a summary report highlighting key insights.

Survey Title: {{{surveyTitle}}}
Survey Description: {{{surveyDescription}}}
Survey Responses: {{{responses}}}

Generate a concise and informative report summarizing the key findings from the survey responses.
`,
});

const generateAISurveyReportFlow = ai.defineFlow(
  {
    name: 'generateAISurveyReportFlow',
    inputSchema: GenerateAISurveyReportInputSchema,
    outputSchema: GenerateAISurveyReportOutputSchema,
  },
  async input => {
    try {
      JSON.parse(input.responses);
    } catch (e) {
      throw new Error('responses is not a valid JSON string');
    }
    const {output} = await prompt(input);
    return output!;
  }
);
