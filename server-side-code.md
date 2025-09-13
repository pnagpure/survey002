# Server-Side Code Reference

This document contains a collection of all the primary server-side logic used in this application.

## Table of Contents
1.  [Server Actions (`src/lib/actions.ts`)](#1-server-actions-srclibactionsts)
2.  [Data Fetching (`src/lib/data.ts`)](#2-data-fetching-srclibdatats)
3.  [Email Service (`src/lib/email.ts`)](#3-email-service-srclibemailts)
4.  [Firebase Initialization (`src/lib/firebase.ts`)](#4-firebase-initialization-srclibfirebasets)
5.  [Email API Route (`src/app/api/send-email/route.ts`)](#5-email-api-route-srcappapisend-emailroutets)
6.  [AI Flows Entry (`src/ai/dev.ts`)](#6-ai-flows-entry-srcaidevts)
7.  [Genkit Configuration (`src/ai/genkit.ts`)](#7-genkit-configuration-srcaigenkitts)
8.  [AI Flow: Report Generation (`src/ai/flows/generate-ai-survey-report.ts`)](#8-ai-flow-report-generation-srcaiflowsgenerate-ai-survey-reportts)
9.  [AI Flow: Text Analysis (`src/ai/flows/analyze-text-responses.ts`)](#9-ai-flow-text-analysis-srcaiflowsanalyze-text-responsests)
10. [AI Flow: Statistical Analysis (`src/ai/flows/perform-statistical-analysis.ts`)](#10-ai-flow-statistical-analysis-srcaiflowsperform-statistical-analysists)
11. [AI Schema: Statistical Analysis (`src/ai/schemas/statistical-analysis.ts`)](#11-ai-schema-statistical-analysis-srcaischemasstatistical-analysists)
12. [Next.js Configuration (`next.config.ts`)](#12-nextjs-configuration-nextconfigts)

---

## 1. Server Actions (`src/lib/actions.ts`)
This file contains the core business logic triggered by user interactions in the UI, such as submitting forms or generating reports.

```typescript
'use server';

import { z } from 'zod';
import { getResponsesBySurveyId, getSurveyById, getAllUsers, getSurveyCollectionById, getUserById } from './data';
import { generateAISurveyReport } from '@/ai/flows/generate-ai-survey-report';
import { analyzeTextResponses } from '@/ai/flows/analyze-text-responses';
import { revalidatePath } from 'next/cache';
import jStat from 'jstat';
import type { Question, Survey, SurveyResponse, SurveyCollection, User } from '@/lib/types';
import { db } from './firebase';
import { collection, addDoc, setDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { sendEmail } from './email';


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
    const newResponse = {
        surveyId,
        userId: 'user-anonymous', // In a real app, this would be the logged-in user's ID
        submittedAt: new Date().toISOString(),
        answers: data,
    };

    await addDoc(collection(db, 'responses'), newResponse);
    
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

    const survey = await getSurveyById(surveyId);
    const responses = await getResponsesBySurveyId(surveyId);

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

export async function createSurvey(data: { title: string, description: string, questions: Question[] }) {
  try {
    const { title, description, questions } = data;
    const surveyRef = doc(collection(db, 'surveys'));
    await setDoc(surveyRef, {
      title,
      description,
      questions,
      createdAt: new Date().toISOString(),
    });
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    console.error("Error creating survey:", error);
    return { success: false, error: "Failed to create survey." };
  }
}

async function findOrCreateUser(user: { name: string, email: string }): Promise<string> {
    try {
        // This is a simplified version. In a real app, you'd query to see if the user exists.
        // For this example, we'll just add them and assume they are new if not found by a simple ID guess.
        // A robust solution would query by email.
        const userRef = doc(collection(db, 'users'));
        await setDoc(userRef, user);
        return userRef.id;
    } catch(error) {
        console.error("Error finding or creating user:", error);
        // Re-throw the error to be caught by the calling function
        throw new Error("Failed to process user data.");
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
        
        const respondentIds = await Promise.all(respondents.map(u => findOrCreateUser(u)));
        const superUserIds = await Promise.all(superUsers.map(u => findOrCreateUser(u)));

        const newCollection = {
            name,
            surveyId,
            schedule,
            userIds: respondentIds,
            superUserIds: superUserIds,
            status: new Date(schedule) <= new Date() ? 'active' : 'pending',
            ...rest,
        };

        await addDoc(collection(db, 'surveyCollections'), newCollection);
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
        const collectionRef = doc(db, 'surveyCollections', collectionId);

        const { respondents, superUsers, ...rest } = data;
        const respondentIds = await Promise.all(respondents.map(u => findOrCreateUser(u)));
        const superUserIds = await Promise.all(superUsers.map(u => findOrCreateUser(u)));

        const updatedData = {
            ...rest,
            userIds: respondentIds,
            superUserIds: superUserIds,
        };
        
        await updateDoc(collectionRef, updatedData);
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
        const collectionRef = doc(db, 'surveyCollections', collectionId);
        await updateDoc(collectionRef, {
            sponsorMessage: data.sponsorMessage,
            sponsorSignature: data.sponsorSignature,
        });

        revalidatePath(`/admin/collections/${collectionId}/preview`);
        return { success: true };
    } catch (error) {
        console.error("Error updating collection content:", error);
        return { success: false, error: "Failed to save content." };
    }
}


export async function sendSurvey(collectionId: string) {
    try {
        const collectionRef = doc(db, 'surveyCollections', collectionId);
        
        const collectionData = await getSurveyCollectionById(collectionId);
        
        if (!collectionData) {
            throw new Error("Collection not found.");
        }
        const survey = await getSurveyById(collectionData.surveyId);

        if (!survey) {
            throw new Error("Survey not found.");
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003';

        const emailPromises = [];

        // Prepare respondent emails
        for (const userId of collectionData.userIds) {
            const user = await getUserById(userId);
            if (user?.email) {
                const surveyLink = `${appUrl}/surveys/${collectionData.surveyId}/take`;
                emailPromises.push(sendEmail({
                    to: user.email,
                    subject: `You're Invited to Take the "${survey.title}" Survey`,
                    htmlBody: `
                        <h1>Hello ${user.name},</h1>
                        <p>You have been invited to participate in the <strong>${survey.title}</strong> survey.</p>
                        <p>${collectionData.sponsorMessage || ''}</p>
                        <a href="${surveyLink}" style="background-color: #1E90FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Take the Survey</a>
                        <br><br>
                        <p>Thank you for your participation!</p>
                        <p><em>${collectionData.sponsorSignature || 'The SurveySwift Team'}</em></p>
                    `
                }));
            }
        }

        // Prepare super-user emails
        for (const userId of collectionData.superUserIds) {
            const user = await getUserById(userId);
            if (user?.email) {
                const resultsLink = `${appUrl}/admin/collections/edit/${collectionData.id}`;
                 emailPromises.push(sendEmail({
                    to: user.email,
                    subject: `Survey "${survey.title}" is now active`,
                    htmlBody: `
                        <h1>Hello ${user.name},</h1>
                        <p>The survey <strong>${survey.title}</strong> associated with the collection <strong>${collectionData.name}</strong> is now active.</p>
                        <p>You can monitor the results and manage the collection using the link below:</p>
                        <a href="${resultsLink}" style="background-color: #8A2BE2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">View Collection & Results</a>
                    `
                }));
            }
        }

        // Send all emails concurrently
        const emailResults = await Promise.all(emailPromises);

        const failures = emailResults.filter(res => !res.success);
        if (failures.length > 0) {
            const firstError = failures[0].error || 'An unknown error occurred during email dispatch.';
            // Still update status but return the error
            await updateDoc(collectionRef, { status: 'active' });
            return { success: false, error: `Failed to send ${failures.length} emails. First error: ${firstError}` };
        }

        await updateDoc(collectionRef, { status: 'active' });
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error sending survey:", error);
        return { success: false, error: "Failed to send survey and notify users." };
    }
}


export async function addUser(user: { name: string; email: string }) {
    try {
        await addDoc(collection(db, 'users'), user);
        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error("Error adding user:", error);
        return { success: false, error: 'Failed to add user.' };
    }
}

export async function deleteUser(userId: string) {
    try {
        const userRef = doc(db, 'users', userId);
        await deleteDoc(userRef);
        // Note: Removing user from collections would require a more complex query/batch write in real Firestore
        revalidatePath('/admin/users');
        revalidatePath('/admin');
        return { success: true };
    } catch (error) {
        console.error("Error deleting user:", error);
        return { success: false, error: 'Failed to delete user.' };
    }
}
```

---

## 2. Data Fetching (`src/lib/data.ts`)
These functions are responsible for all interactions with the Firestore database, such as fetching surveys, responses, and users.

```typescript
import { db } from './firebase';
import type { Survey, SurveyResponse, SurveyCollection, User } from './types';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';

export async function getAllSurveys(): Promise<Survey[]> {
    try {
        const surveysCol = collection(db, 'surveys');
        const surveySnapshot = await getDocs(surveysCol);
        const surveyList = surveySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Survey));
        return surveyList;
    } catch (error) {
        console.error("Error fetching all surveys:", error);
        return [];
    }
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
    try {
        const responsesCol = collection(db, 'responses');
        const responseSnapshot = await getDocs(responsesCol);
        const responseList = responseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyResponse));
        return responseList;
    } catch (error) {
        console.error("Error fetching all responses:", error);
        return [];
    }
}

export async function getAllSurveyCollections(): Promise<SurveyCollection[]> {
    try {
        const collectionsCol = collection(db, 'surveyCollections');
        const collectionSnapshot = await getDocs(collectionsCol);
        const collectionList = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyCollection));
        return collectionList;
    } catch (error) {
        console.error("Error fetching all survey collections:", error);
        return [];
    }
}

export async function getAllUsers(): Promise<User[]> {
    try {
        const usersCol = collection(db, 'users');
        const userSnapshot = await getDocs(usersCol);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        return userList;
    } catch (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
}

export async function getSurveyById(id: string): Promise<Survey | undefined> {
  try {
    const surveyDoc = doc(db, 'surveys', id);
    const surveySnapshot = await getDoc(surveyDoc);
    if (surveySnapshot.exists()) {
      return { id: surveySnapshot.id, ...surveySnapshot.data() } as Survey;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching survey by id ${id}:`, error);
    return undefined;
  }
}

export async function getResponsesBySurveyId(surveyId: string): Promise<SurveyResponse[]> {
  try {
    const responsesCol = collection(db, 'responses');
    const q = query(responsesCol, where('surveyId', '==', surveyId));
    const responseSnapshot = await getDocs(q);
    return responseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyResponse));
  } catch (error) {
      console.error(`Error fetching responses by surveyId ${surveyId}:`, error);
      return [];
  }
}

export async function getSurveyCollectionById(id: string): Promise<SurveyCollection | undefined> {
  try {
    const collectionDoc = doc(db, 'surveyCollections', id);
    const collectionSnapshot = await getDoc(collectionDoc);
    if (collectionSnapshot.exists()) {
      return { id: collectionSnapshot.id, ...collectionSnapshot.data() } as SurveyCollection;
    }
    return undefined;
  } catch (error) {
      console.error(`Error fetching survey collection by id ${id}:`, error);
      return undefined;
  }
}

export async function getSurveyCollectionsBySurveyId(surveyId: string): Promise<SurveyCollection[]> {
    try {
        const collectionsCol = collection(db, 'surveyCollections');
        const q = query(collectionsCol, where('surveyId', '==', surveyId));
        const collectionSnapshot = await getDocs(q);
        return collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SurveyCollection));
    } catch (error) {
        console.error(`Error fetching survey collections by surveyId ${surveyId}:`, error);
        return [];
    }
}

export async function getUserById(id: string): Promise<User | undefined> {
    try {
        const userDoc = doc(db, 'users', id);
        const userSnapshot = await getDoc(userDoc);
        if(userSnapshot.exists()) {
            return { id: userSnapshot.id, ...userSnapshot.data() } as User;
        }
        return undefined;
    } catch (error) {
        console.error(`Error fetching user by id ${id}:`, error);
        return undefined;
    }
}
```

---

## 3. Email Service (`src/lib/email.ts`)
This file handles authentication with Microsoft Graph and the sending of emails.

```typescript
'use server';

import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_GRAPH_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_GRAPH_TENANT_ID}`,
        clientSecret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET!,
    },
};

const cca = new ConfidentialClientApplication(msalConfig);

async function getGraphToken() {
    try {
        const tokenRequest = {
            scopes: ['https://graph.microsoft.com/.default'],
        };
        const response = await cca.acquireTokenByClientCredential(tokenRequest);
        return response?.accessToken;
    } catch (error) {
        console.error("Error acquiring MS Graph token:", error);
        throw new Error("Failed to get authentication token for MS Graph.");
    }
}

interface EmailPayload {
    to: string;
    subject: string;
    htmlBody: string;
}

// Optional: Input validation (expand as needed)
function validatePayload({ to, subject, htmlBody }: EmailPayload): { valid: boolean; error?: string } {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) return { valid: false, error: 'Invalid recipient email address.' };
    if (!subject || subject.length > 1000) return { valid: false, error: 'Subject is required and must be under 1000 chars.' };
    if (!htmlBody || htmlBody.length > 1000000) return { valid: false, error: 'HTML body is required and must be under 1MB.' };
    return { valid: true };
}


export async function sendEmail({ to, subject, htmlBody }: EmailPayload): Promise<{ success: boolean, error?: string }> {
    // Validate inputs
    const validation = validatePayload({ to, subject, htmlBody });
    if (!validation.valid) {
        return { success: false, error: validation.error };
    }

    const accessToken = await getGraphToken();
    if (!accessToken) {
        return { success: false, error: 'Could not authenticate with email service. Check your MSAL configuration in the .env file.' };
    }

    const senderEmail = process.env.MICROSOFT_GRAPH_USER_ID;
    if (!senderEmail) {
        return { success: false, error: 'Sender email address (MICROSOFT_GRAPH_USER_ID) is not configured in the .env file.' };
    }

    const endpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;

    const emailMessage = {
        message: {
            subject: subject,
            body: {
                contentType: 'HTML',
                content: htmlBody,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: to,
                    },
                },
            ],
            isDeliveryReceiptRequested: true,
        },
        saveToSentItems: true,
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailMessage),
        });

        if (response.status === 202) {
            console.log(`Successfully queued email to ${to} for sending.`);
            return { success: true };
        } else {
            const errorBody = await response.json();
            const errorMessage = errorBody?.error?.message || `API responded with status ${response.status}.`;
            const errorCode = errorBody?.error?.code || 'Unknown';
            console.error('Failed to send email:', JSON.stringify(errorBody, null, 2));
            return { success: false, error: `[${errorCode}] ${errorMessage}` };
        }
    } catch (error) {
        console.error("Error sending email via MS Graph:", error);
        return { success: false, error: 'An unexpected error occurred while sending the email.' };
    }
}
```

---

## 4. Firebase Initialization (`src/lib/firebase.ts`)
Handles the setup and connection to your Firebase project.

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app (singleton)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
```

---

## 5. Email API Route (`src/app/api/send-email/route.ts`)
A dedicated API endpoint for sending emails, which can be used for testing or other integrations.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, htmlBody } = body;

    if (!to || !subject || !htmlBody) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, htmlBody' }, { status: 400 });
    }

    const result = await sendEmail({ to, subject, htmlBody });

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Email queued successfully' });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
```

---

## 6. AI Flows Entry (`src/ai/dev.ts`)
This file is the entry point for running the Genkit flows in a development environment.

```typescript
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-ai-survey-report.ts';
import '@/ai/flows/analyze-text-responses.ts';
import '@/ai/flows/perform-statistical-analysis.ts';
```

---

## 7. Genkit Configuration (`src/ai/genkit.ts`)
This file configures the Genkit framework, specifying the AI models and plugins to be used.

```typescript
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
```

---

## 8. AI Flow: Report Generation (`src/ai/flows/generate-ai-survey-report.ts`)
This Genkit flow uses an AI model to generate a summary report from survey data.

```typescript
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
```

---

## 9. AI Flow: Text Analysis (`src/ai/flows/analyze-text-responses.ts`)
This flow analyzes free-text survey responses to identify themes, sentiment, and keywords.

```typescript
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
```

---

## 10. AI Flow: Statistical Analysis (`src/ai/flows/perform-statistical-analysis.ts`)
This flow uses an AI model to perform statistical tests like Chi-Square on categorical survey data.

```typescript
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
```

---

## 11. AI Schema: Statistical Analysis (`src/ai/schemas/statistical-analysis.ts`)
Defines the Zod schemas for the inputs and outputs of the statistical analysis flow.

```typescript
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
```

---

## 12. Next.js Configuration (`next.config.ts`)
The main configuration file for the Next.js application.

```typescript
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
```
