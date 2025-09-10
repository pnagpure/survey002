import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ai-survey-report.ts';
import '@/ai/flows/analyze-text-responses.ts';
import '@/ai/flows/perform-statistical-analysis.ts';
