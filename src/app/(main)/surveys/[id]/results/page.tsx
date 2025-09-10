import { getSurveyById, getResponsesBySurveyId } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyResults } from "@/components/survey-results";
import { ShareButton } from "@/components/share-button";

export default function SurveyResultsPage({
  params,
}: {
  params: { id: string };
}) {
  const survey = getSurveyById(params.id);
  const responses = getResponsesBySurveyId(params.id);

  if (!survey) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{survey.title} - Results</h1>
          <p className="text-muted-foreground mt-1">
            A real-time analysis of your survey responses.
          </p>
        </div>
        <ShareButton surveyId={survey.id} />
      </div>

      <SurveyResults survey={survey} responses={responses} />
    </div>
  );
}
