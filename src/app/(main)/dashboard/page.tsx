import Link from "next/link";
import { getAllSurveys } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BarChart2, CheckSquare, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QuestionTypeTable from "@/components/question-type-table";

export default async function DashboardPage() {
  const surveys = await getAllSurveys();
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to SurveySwift. Here are your current surveys.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <Card key={survey.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{survey.title}</CardTitle>
              <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <Badge variant="outline">
                {new Date(survey.createdAt).toLocaleDateString()}
              </Badge>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link href={`/surveys/${survey.id}/take`}>
                  <CheckSquare className="mr-2 h-4 w-4" />
                  Take Survey
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href={`/surveys/${survey.id}/results`}>
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Results
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
         <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-muted/50 hover:border-primary transition-colors">
            <CardHeader className="text-center">
              <CardTitle>Create a New Survey</CardTitle>
              <CardDescription>Get started in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/admin/surveys/create"><Plus className="mr-2 h-4 w-4"/>Create Survey</Link>
              </Button>
            </CardContent>
         </Card>
      </div>
      
      <QuestionTypeTable />
    </div>
  );
}
