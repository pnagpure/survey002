import Link from "next/link";
import {
  FileText,
  Home,
  PlusCircle,
  BarChart2,
} from "lucide-react";
import { surveys } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function MainSidebar() {
  return (
    <aside className="w-80 min-w-80 hidden lg:flex flex-col gap-4 border-r bg-card p-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-primary/20 text-primary rounded-lg">
          <BarChart2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">SurveySwift</h1>
      </div>

      <nav className="flex flex-col gap-2 mt-4">
        <Button variant="ghost" className="justify-start gap-2" asChild>
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </Button>
        <Button variant="ghost" className="justify-start gap-2" asChild>
          <Link href="/surveys/create">
            <PlusCircle className="h-4 w-4" />
            New Survey
          </Link>
        </Button>
      </nav>

      <div className="mt-4 flex-1 overflow-y-auto">
        <h2 className="px-4 text-lg font-semibold tracking-tight text-foreground">
          Surveys
        </h2>
        <div className="space-y-2 p-2">
          {surveys.map((survey) => (
            <Link key={survey.id} href={`/surveys/${survey.id}/results`} className="block">
              <div className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground truncate">{survey.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
