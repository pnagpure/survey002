'use client';

import { useMemo, useState } from 'react';
import type { Survey, SurveyResponse } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { generateReport } from '@/lib/actions';
import { Bot, Loader2, FileText, BarChart2 as BarChartIcon, Star, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';

interface ProcessedResults {
  [questionId: string]: {
    type: 'rating' | 'multiple-choice' | 'text';
    title: string;
    icon: React.ElementType;
    data: any;
  };
}

const icons = {
    rating: Star,
    'multiple-choice': BarChartIcon,
    text: MessageSquare,
}

export function SurveyResults({ survey, responses }: { survey: Survey; responses: SurveyResponse[] }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const processedResults = useMemo<ProcessedResults>(() => {
    if (!responses.length) return {};
    
    return survey.questions.reduce((acc, q) => {
        const common = { title: q.text, icon: icons[q.type] };
      if (q.type === 'rating') {
        const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
            name: `${rating} Star${rating > 1 ? 's' : ''}`,
            value: responses.filter(r => r.answers[q.id] === rating || String(r.answers[q.id]) === String(rating)).length,
        }));
        acc[q.id] = { ...common, type: 'rating', data: ratingCounts };
      } else if (q.type === 'multiple-choice' && q.options) {
        const optionCounts = q.options.map(option => ({
            name: option,
            value: responses.filter(r => r.answers[q.id] === option).length,
        }));
        acc[q.id] = { ...common, type: 'multiple-choice', data: optionCounts };
      } else if (q.type === 'text') {
        const textAnswers = responses.map(r => r.answers[q.id]).filter(Boolean);
        acc[q.id] = { ...common, type: 'text', data: textAnswers };
      }
      return acc;
    }, {} as ProcessedResults);
  }, [survey, responses]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setReport(null);
    const formData = new FormData();
    formData.append('surveyId', survey.id);

    const result = await generateReport(formData);
    
    if (result.success) {
      setReport(result.report!);
    } else {
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: result.error,
      });
    }

    setIsGenerating(false);
  };
  
  if (responses.length === 0) {
    return (
        <Card className="text-center py-12">
            <CardHeader>
                <CardTitle>No responses yet</CardTitle>
                <CardDescription>Share your survey to start collecting responses.</CardDescription>
            </CardHeader>
        </Card>
    )
  }

  return (
    <div className="space-y-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Bot />
                        AI-Powered Report
                    </CardTitle>
                    <CardDescription>A summary of key insights from your survey data.</CardDescription>
                </div>
                <Button onClick={handleGenerateReport} disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Generate Report
                </Button>
            </CardHeader>
            {(isGenerating || report) && (
                <CardContent>
                    {isGenerating && (
                        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="ml-4 text-muted-foreground">Analyzing responses and generating your report...</p>
                        </div>
                    )}
                    {report && (
                         <div className="prose prose-sm max-w-none p-6 bg-muted/50 rounded-lg whitespace-pre-wrap font-serif">{report}</div>
                    )}
                </CardContent>
            )}
        </Card>

      {Object.keys(processedResults).map(questionId => {
        const result = processedResults[questionId];
        const Icon = result.icon;
        return (
          <Card key={questionId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Icon className="text-primary"/>{result.title}</CardTitle>
            </CardHeader>
            <CardContent>
              { (result.type === 'rating' || result.type === 'multiple-choice') && result.data.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={result.data} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))'}} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              { result.type === 'text' && result.data.length > 0 && (
                <ScrollArea className="h-60 w-full rounded-md border">
                    <div className="p-4 space-y-4">
                    {result.data.map((answer: string, index: number) => (
                        <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                            {answer}
                        </div>
                    ))}
                    </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}
