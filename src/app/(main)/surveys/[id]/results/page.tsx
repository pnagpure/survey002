import { getSurveyById, getResponsesBySurveyId } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyResults } from "@/components/survey-results";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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

  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/surveys/${survey.id}/take` : `/surveys/${survey.id}/take`;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{survey.title} - Results</h1>
          <p className="text-muted-foreground">
            See a real-time analysis of your survey responses.
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" onClick={() => navigator.clipboard.writeText(shareUrl)}>
                <Share2 className="mr-2 h-4 w-4" /> Share Survey
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy survey link to clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <SurveyResults survey={survey} responses={responses} />
    </div>
  );
}
