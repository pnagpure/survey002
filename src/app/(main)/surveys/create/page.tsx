import { SurveyCreator } from "@/components/survey-creator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CreateSurveyPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create a New Survey</h1>
        <p className="text-muted-foreground">
          Build your survey from scratch. Add questions and define their types.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
            <SurveyCreator />
        </CardContent>
      </Card>
    </div>
  );
}
