import Link from "next/link";
import {
  FileText,
  Home,
  PlusCircle,
  BarChart2,
  Shield,
} from "lucide-react";
import { getAllSurveys, getResponsesBySurveyId } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

async function SurveyList() {
    const surveys = await getAllSurveys();

    // Fetch all responses in parallel
    const responsesPromises = surveys.map(survey => getResponsesBySurveyId(survey.id));
    const responsesBySurvey = await Promise.all(responsesPromises);

    return (
        <div className="space-y-1 mt-2">
          {surveys.map((survey, index) => (
            <Link key={survey.id} href={`/surveys/${survey.id}/results`} className="block">
              <div className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate flex-1">{survey.title}</span>
                <Badge variant="secondary">{responsesBySurvey[index].length}</Badge>
              </div>
            </Link>
          ))}
        </div>
    )
}

export function MainSidebar() {
  return (
    <aside className="w-80 min-w-80 hidden lg:flex flex-col gap-4 border-r bg-card p-4">
      <div className="flex items-center gap-3 p-2">
        <div className="p-2 bg-primary/20 text-primary rounded-lg">
          <BarChart2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-foreground">SurveySwift</h1>
      </div>

      <nav className="flex flex-col gap-1 p-2">
        <Button variant="ghost" className="justify-start gap-3" asChild>
          <Link href="/dashboard">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-3" asChild>
          <Link href="/admin">
            <Shield className="h-5 w-5" />
            Admin
          </Link>
        </Button>
      </nav>

      <div className="mt-4 flex-1 overflow-y-auto px-2">
        <h2 className="px-2 text-sm font-semibold tracking-tight text-muted-foreground uppercase">
          Surveys
        </h2>
        <SurveyList />
      </div>
    </aside>
  );
}
