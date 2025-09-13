import Link from "next/link";
import { BarChart2 } from "lucide-react";

export default function TakeSurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-muted/40">
      <header className="p-4 bg-background border-b">
         <Link href="/" className="flex items-center gap-2 text-foreground">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <BarChart2 className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">SurveySwift</span>
          </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        Powered by SurveySwift
      </footer>
    </div>
  );
}
