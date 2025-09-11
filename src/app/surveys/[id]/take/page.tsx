import { getSurveyById, getSurveyCollectionsBySurveyId } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyForm } from "./survey-form";
import type { SurveyCollection } from '@/lib/types';

// Helper to find which collection this survey belongs to for the user
const findCollectionForSurvey = async (surveyId: string): Promise<SurveyCollection | undefined> => {
    // In a real app, you'd also check if the current user is part of the collection
    const collections = await getSurveyCollectionsBySurveyId(surveyId);
    return collections[0]; // For this mock, just return the first one found
}

export default async function TakeSurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const survey = await getSurveyById(params.id);
  
  if (!survey) {
    notFound();
  }
  
  const collection = await findCollectionForSurvey(params.id);

  return (
    <SurveyForm survey={survey} collection={collection} />
  );
}
