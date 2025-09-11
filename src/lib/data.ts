
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
