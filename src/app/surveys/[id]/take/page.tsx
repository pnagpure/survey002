
import { getSurveyById, getSurveyCollectionsBySurveyId } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyForm } from "./survey-form";
import type { SurveyCollection } from '@/lib/types';

// Helper to find which collection this survey belongs to for the user
const findCollectionForSurvey = (surveyId: string): SurveyCollection | undefined => {
    // In a real app, you'd also check if the current user is part of the collection
    const collections = getSurveyCollectionsBySurveyId(surveyId);
    return collections[0]; // For this mock, just return the first one found
}

export default function TakeSurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const survey = getSurveyById(params.id);
  
  if (!survey) {
    notFound();
  }
  
  const collection = findCollectionForSurvey(params.id);

  return (
    <SurveyForm survey={survey} collection={collection} />
  );
}
