import { getSurveyById } from "@/lib/data";
import { notFound } from "next/navigation";
import { SurveyTaker } from "@/components/survey-taker";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TakeSurveyPage({
  params,
}: {
  params: { id: string };
}) {
  const survey = getSurveyById(params.id);

  if (!survey) {
    notFound();
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl">
      <CardHeader>
        <CardTitle className="text-3xl">{survey.title}</CardTitle>
        <CardDescription>{survey.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SurveyTaker survey={survey} />
      </CardContent>
    </Card>
  );
}
