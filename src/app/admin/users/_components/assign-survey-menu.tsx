
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { getAllSurveys } from "@/lib/data";
import { useEffect, useState } from "react";
import type { Survey } from "@/lib/types";

export function AssignSurveyMenu() {
  const [surveys, setSurveys] = useState<Survey[]>([]);

  useEffect(() => {
    async function fetchSurveys() {
        const fetchedSurveys = await getAllSurveys();
        setSurveys(fetchedSurveys);
    }
    fetchSurveys();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Assign Survey</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {surveys.map(survey => (
          <DropdownMenuItem key={survey.id} onSelect={() => alert(`Assigned "${survey.title}"`)}>
            {survey.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
