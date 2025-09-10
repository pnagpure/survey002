

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getSurveyById, getSurveyCollectionsBySurveyId } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyTaker } from "@/components/survey-taker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { Survey, SurveyCollection } from '@/lib/types';


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
  const collection = findCollectionForSurvey(params.id);
  const [hasStarted, setHasStarted] = useState(!collection?.cohortType && !collection?.sponsorMessage); // Skip welcome if no branding/message


  if (!survey) {
    notFound();
  }

  const welcomeContent = {
    organisation: "Your feedback is important to our organization.",
    university: "Your responses will contribute to our academic community.",
    government: "Your participation is appreciated for this public survey.",
    general: "Thank you for taking the time to share your thoughts.",
  };

  if (!hasStarted) {
     return (
        <Card className="w-full max-w-2xl shadow-xl">
            <CardHeader className="text-center space-y-4 pt-10">
                {collection?.logoDataUri && (
                    <Image 
                        src={collection.logoDataUri} 
                        alt="Cohort Logo" 
                        width={100} 
                        height={100} 
                        className="mx-auto rounded-lg object-contain"
                    />
                )}
                <CardTitle className="text-3xl font-bold">{survey.title}</CardTitle>
                <CardDescription className="text-lg px-6">
                    {collection?.cohortType ? welcomeContent[collection.cohortType] : survey.description}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {collection?.sponsorMessage && (
                    <div className="px-6 py-4 bg-muted/50 rounded-lg text-center space-y-3">
                        <p className="text-muted-foreground italic">"{collection.sponsorMessage}"</p>
                        {collection.sponsorSignature && (
                            <p className="font-semibold text-sm text-foreground">- {collection.sponsorSignature}</p>
                        )}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-center pb-8 pt-4">
                <Button size="lg" onClick={() => setHasStarted(true)}>
                    Start Survey
                    <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
            </CardFooter>
        </Card>
     )
  }

  return (
    <Card className="w-full max-w-2xl shadow-xl border-t-4 border-t-primary">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">{survey.title}</CardTitle>
        <CardDescription className="text-lg">{survey.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SurveyTaker survey={survey} />
      </CardContent>
    </Card>
  );
}
