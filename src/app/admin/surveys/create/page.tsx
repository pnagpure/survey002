import { SurveyCreator } from "@/components/survey-creator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CreateSurveyPage() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
       <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Create a New Survey</h1>
            <p className="text-muted-foreground">
            Build your survey from scratch. Add questions and define their types.
            </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
            </Link>
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
            <SurveyCreator />
        </CardContent>
      </Card>
    </div>
  );
}
