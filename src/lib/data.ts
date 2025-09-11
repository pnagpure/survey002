/**
 * @fileoverview
 * This file contains data access functions for the application.
 * It reads from the local "database" in `db.ts` and transforms the data
 * into the array format expected by the components.
 */

import { db } from './db';
import type { Survey, SurveyResponse, SurveyCollection, User } from './types';


// Helper function to convert a collection object to an array with IDs
function collectionToArray<T>(collection: Record<string, Omit<T, 'id'>>): T[] {
    return Object.entries(collection).map(([id, data]) => ({
        id,
        ...data,
    } as T));
}

export function getAllSurveys(): Survey[] {
    return collectionToArray<Survey>(db.surveys);
}

export function getAllResponses(): SurveyResponse[] {
    return collectionToArray<SurveyResponse>(db.responses);
}

export function getAllSurveyCollections(): SurveyCollection[] {
    return collectionToArray<SurveyCollection>(db.surveyCollections);
}

export function getAllUsers(): User[] {
    return collectionToArray<User>(db.users);
}

export function getSurveyById(id: string): Survey | undefined {
  const surveyData = db.surveys[id];
  return surveyData ? { id, ...surveyData } : undefined;
}

export function getResponsesBySurveyId(surveyId: string): SurveyResponse[] {
  return Object.entries(db.responses)
    .filter(([, response]) => response.surveyId === surveyId)
    .map(([id, response]) => ({ id, ...response }));
}

export function getSurveyCollectionById(id: string): SurveyCollection | undefined {
  const collectionData = db.surveyCollections[id];
  return collectionData ? { id, ...collectionData } : undefined;
}

export function getSurveyCollectionsBySurveyId(surveyId: string): SurveyCollection[] {
    return Object.entries(db.surveyCollections)
      .filter(([, collection]) => collection.surveyId === surveyId)
      .map(([id, collection]) => ({ id, ...collection }));
}

export function getUserById(id: string): User | undefined {
    const userData = db.users[id];
    return userData ? { id, ...userData } : undefined;
}
