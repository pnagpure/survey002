/**
 * @fileOverview Schemas for the statistical analysis flow.
 */

import { z } from 'genkit';

export const PerformStatisticalAnalysisInputSchema = z.object({
  testType: z
    .enum(['chi-square'])
    .describe('The type of statistical test to perform.'),
  question1: z.object({
    id: z.string(),
    text: z.string(),
    type: z.string(),
  }),
  question2: z.object({
    id: z.string(),
    text: z.string(),
    type: z.string(),
  }),
  responses: z
    .string()
    .describe('A stringified JSON array of all survey responses.'),
});

export type PerformStatisticalAnalysisInput = z.infer<
  typeof PerformStatisticalAnalysisInputSchema
>;

export const PerformStatisticalAnalysisOutputSchema = z.object({
  interpretation: z
    .string()
    .describe(
      'A natural language interpretation of the statistical results.'
    ),
  p_value: z.number().describe('The p-value from the statistical test.'),
  statistic: z
    .number()
    .describe('The test statistic (e.g., Chi-Square value).'),
  is_significant: z
    .boolean()
    .describe(
      'Whether the result is statistically significant at the p < 0.05 level.'
    ),
});

export type PerformStatisticalAnalysisOutput = z.infer<
  typeof PerformStatisticalAnalysisOutputSchema
>;
