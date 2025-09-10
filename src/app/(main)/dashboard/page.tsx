import Link from "next/link";
import { surveys } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, BarChart2, CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
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
              <CardTitle className="tracking-tight">{survey.title}</CardTitle>
              <CardDescription className="line-clamp-2">{survey.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
               <Badge variant="outline">
                {new Date(survey.createdAt).toLocaleDateString()}
              </Badge>
            </CardContent>
            <CardFooter className="flex gap-2">
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
         <Card className="flex flex-col items-center justify-center border-dashed">
            <CardHeader>
              <CardTitle>Create a New Survey</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/surveys/create">Get Started</Link>
              </Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
