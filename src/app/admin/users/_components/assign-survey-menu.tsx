
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { surveys } from "@/lib/data";

export function AssignSurveyMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">Assign Survey</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {surveys.map(survey => (
          <DropdownMenuItem key={survey.id}>
            {survey.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
