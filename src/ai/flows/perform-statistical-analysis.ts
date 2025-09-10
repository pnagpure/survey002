'use server';
/**
 * @fileOverview A statistical analysis engine for survey data.
 *
 * - performStatisticalAnalysis - A function that performs a statistical test on survey data.
 */

import { ai } from '@/ai/genkit';
import {
  PerformStatisticalAnalysisInputSchema,
  PerformStatisticalAnalysisOutputSchema,
  type PerformStatisticalAnalysisInput,
  type PerformStatisticalAnalysisOutput,
} from '@/ai/schemas/statistical-analysis';

export async function performStatisticalAnalysis(
  input: PerformStatisticalAnalysisInput
): Promise<PerformStatisticalAnalysisOutput> {
  return performStatisticalAnalysisFlow(input);
}


const prompt = ai.definePrompt({
  name: 'performStatisticalAnalysisPrompt',
  input: { schema: PerformStatisticalAnalysisInputSchema },
  output: { schema: PerformStatisticalAnalysisOutputSchema },
  prompt: `You are an expert statistician. Your task is to perform a {{testType}} test and interpret the results.

The user wants to see if there is a statistically significant association between the responses to two survey questions.

Question 1: "{{question1.text}}" (Type: {{question1.type}})
Question 2: "{{question2.text}}" (Type: {{question2.type}})

Responses Data:
{{{responses}}}

1.  **Verify Suitability**: First, confirm if a Chi-Square test is appropriate for these question types. Both questions must be categorical (e.g., multiple-choice, yes/no, dropdown). If not, explain why the test is unsuitable and set p_value and statistic to -1 and is_significant to false.

2.  **Perform Chi-Square Test**: If the test is suitable, calculate the Chi-Square statistic and the p-value.
    *   Construct a contingency table from the responses for the two questions.
    *   Calculate the Chi-Square statistic based on the observed and expected frequencies.
    *   Determine the p-value from the Chi-Square statistic and the degrees of freedom.

3.  **Interpret the Results**:
    *   Set the 'statistic' and 'p_value' fields in the output.
    *   Set 'is_significant' to true if the p-value is less than 0.05, otherwise set it to false.
    *   Provide a clear, easy-to-understand 'interpretation' of the result. Explain what the p-value means in this context and what the conclusion is regarding the association between the two questions. For example: "The p-value of [p-value] indicates that there is a [significant/non-significant] association between [Question 1] and [Question 2]. This means..."

Your final output must be in the specified JSON format.
`,
});


const performStatisticalAnalysisFlow = ai.defineFlow(
  {
    name: 'performStatisticalAnalysisFlow',
    inputSchema: PerformStatisticalAnalysisInputSchema,
    outputSchema: PerformStatisticalAnalysisOutputSchema,
  },
  async (input) => {
    // In a real-world scenario, you might use a library like 'chi-squared' or a Python script to do the actual calculation.
    // For this demonstration, we are using an LLM to perform the calculation and interpretation.
    // This is a powerful approach but may have limitations for very large datasets or require high precision.

    const { output } = await prompt(input);
    return output!;
  }
);
