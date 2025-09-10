'use server';
/**
 * @fileOverview AI-powered text response analyzer.
 *
 * - analyzeTextResponses - A function that analyzes a set of free-text responses to find themes and keywords.
 * - AnalyzeTextResponsesInput - The input type for the analyzeTextResponses function.
 * - AnalyzeTextResponsesOutput - The return type for the analyzeTextResponses function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextResponsesInputSchema = z.object({
  question: z.string().describe('The survey question that was asked.'),
  responses: z
    .string()
    .describe(
      'A stringified JSON array of the text responses to the question.'
    ),
});

export type AnalyzeTextResponsesInput = z.infer<
  typeof AnalyzeTextResponsesInputSchema
>;

const AnalyzeTextResponsesOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise summary of the main themes and sentiments found in the responses.'
    ),
  keywords: z
    .array(z.string())
    .describe('A list of the most important keywords or phrases mentioned.'),
});

export type AnalyzeTextResponsesOutput = z.infer<
  typeof AnalyzeTextResponsesOutputSchema
>;

export async function analyzeTextResponses(
  input: AnalyzeTextResponsesInput
): Promise<AnalyzeTextResponsesOutput> {
  return analyzeTextResponsesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeTextResponsesPrompt',
  input: {schema: AnalyzeTextResponsesInputSchema},
  output: {schema: AnalyzeTextResponsesOutputSchema},
  prompt: `You are an expert at analyzing qualitative data. You will be given a survey question and a list of text responses.

Your task is to identify the main themes, summarize the overall sentiment, and extract the most important keywords from the responses.

Survey Question: {{{question}}}
Responses:
{{{responses}}}

Provide a summary and a list of keywords.
`,
});

const analyzeTextResponsesFlow = ai.defineFlow(
  {
    name: 'analyzeTextResponsesFlow',
    inputSchema: AnalyzeTextResponsesInputSchema,
    outputSchema: AnalyzeTextResponsesOutputSchema,
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
