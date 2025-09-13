
import { getSurveyCollectionById, getSurveyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PreviewForm } from './preview-form';


export default async function PreviewSurveyPage({ params }: { params: { id: string } }) {
  const id = params.id;
  
  const collection = await getSurveyCollectionById(id);
  if (!collection) {
    notFound();
  }

  const survey = await getSurveyById(collection.surveyId);
  if (!survey) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preview & Send</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Final review for collection: <span className="font-semibold text-primary">{collection.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
            </Link>
            </Button>
        </div>
      </div>
      
      <PreviewForm collection={collection} survey={survey} />

    </div>
  );
}
