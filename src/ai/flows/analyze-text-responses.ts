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
      'A concise summary of the main themes and overall sentiment found in the responses.'
    ),
  keywords: z
    .array(z.string())
    .describe('A list of the most important keywords or phrases mentioned.'),
  sentiment: z
    .object({
      overall: z
        .enum(['Positive', 'Negative', 'Neutral', 'Mixed'])
        .describe('The overall sentiment of the responses.'),
      positivePercentage: z
        .number()
        .min(0)
        .max(100)
        .describe('The percentage of responses with a positive sentiment.'),
      negativePercentage: z
        .number()
        .min(0)
        .max(100)
        .describe('The percentage of responses with a negative sentiment.'),
      neutralPercentage: z
        .number()
        .min(0)
        .max(100)
        .describe('The percentage of responses with a neutral sentiment.'),
    })
    .describe(
      'A statistical breakdown of the sentiment across all responses.'
    ),
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

Your task is to identify the main themes, summarize the overall sentiment, and extract the most important keywords.

In addition, perform a detailed sentiment analysis on the responses. Classify each response as 'Positive', 'Negative', or 'Neutral'. Then, calculate the percentage of total responses that fall into each category. The sum of percentages must equal 100. Determine an overall sentiment ('Positive', 'Negative', 'Neutral', or 'Mixed').

Survey Question: {{{question}}}
Responses:
{{{responses}}}

Provide a summary, a list of keywords, and the detailed sentiment analysis breakdown.
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
