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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { generateReport, analyzeText } from '@/lib/actions';
import { Bot, Loader2, FileText, BarChart2 as BarChartIcon, Star, MessageSquare, Lightbulb, Search, Tags, Percent, Smile, Frown, Meh, ChevronDown, PieChart as PieChartIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';

interface SentimentAnalysis {
    overall: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
}

interface TextAnalysis {
  summary: string;
  keywords: string[];
  sentiment: SentimentAnalysis;
}

type AnalysisType = 'bar-chart' | 'pie-chart' | 'text-analysis' | 'raw-text' | 'none';

interface ProcessedResults {
  [questionId: string]: {
    type: string;
    title: string;
    icon: React.ElementType;
    data: any;
    textAnalysis?: TextAnalysis | null;
    isAnalyzing?: boolean;
    selectedAnalysis: AnalysisType;
  };
}

const icons: { [key: string]: React.ElementType } = {
    rating: Star,
    'multiple-choice': BarChartIcon,
    text: MessageSquare,
    yesNo: BarChartIcon,
    dropdown: BarChartIcon,
    ranking: BarChartIcon,
    matrix: BarChartIcon,
    number: BarChartIcon,
    date: BarChartIcon,
    file: FileText,
}

const sentimentColors = {
    positive: 'hsl(var(--chart-1))', // Blue
    neutral: 'hsl(var(--chart-2))',  // Yellow
    negative: 'hsl(var(--destructive))', // Red
}

const pieColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
    'hsl(var(--secondary))',
];


export function SurveyResults({ survey, responses }: { survey: Survey; responses: SurveyResponse[] }) {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [processedResults, setProcessedResults] = useState<ProcessedResults>(
    useMemo(() => {
        if (!responses.length) return {};
        
        return survey.questions.reduce((acc, q) => {
            const common = { 
                title: q.text, 
                icon: icons[q.type] || FileText, 
                textAnalysis: null, 
                isAnalyzing: false, 
                selectedAnalysis: 'none' as AnalysisType 
            };
            const questionType = q.type;

            let data;
            if (['rating', 'multiple-choice', 'yesNo', 'dropdown'].includes(questionType)) {
                let counts: { [key: string]: number } = {};
                if (questionType === 'rating') {
                    counts = responses.reduce((c, r) => {
                        const answer = r.answers[q.id];
                        c[answer] = (c[answer] || 0) + 1;
                        return c;
                    }, {} as { [key: string]: number });
                } else if (questionType === 'multiple-choice' && q.options) {
                     const getAnswers = (r: SurveyResponse) => {
                        const answer = r.answers[q.id];
                        return Array.isArray(answer) ? answer : [answer];
                    };
                    counts = responses.flatMap(getAnswers).reduce((c, answer) => {
                         c[answer] = (c[answer] || 0) + 1;
                         return c;
                    }, {} as { [key: string]: number });
                } else if (questionType === 'yesNo') {
                    counts = responses.reduce((c, r) => {
                        const answer = r.answers[q.id];
                        c[answer] = (c[answer] || 0) + 1;
                        return c;
                    }, {} as { [key: string]: number });
                } else if (questionType === 'dropdown' && q.options) {
                    counts = responses.reduce((c, r) => {
                        const answer = r.answers[q.id];
                        c[answer] = (c[answer] || 0) + 1;
                        return c;
                    }, {} as { [key: string]: number });
                }
                
                data = Object.entries(counts).map(([name, value]) => ({ name, value }));

                acc[q.id] = { ...common, type: questionType, data: data };
            } else if (questionType === 'text') {
                const textAnswers = responses.map(r => r.answers[q.id]).filter(Boolean);
                acc[q.id] = { ...common, type: 'text', data: textAnswers };
            }
            // Add other question type processing here
            return acc;
        }, {} as ProcessedResults);
    }, [survey, responses])
  );
  
  const handleSetAnalysis = (questionId: string, analysis: AnalysisType) => {
    setProcessedResults(prev => ({
      ...prev,
      [questionId]: { ...prev[questionId], selectedAnalysis: analysis }
    }));

    if (analysis === 'text-analysis' && !processedResults[questionId].textAnalysis) {
      handleAnalyzeText(questionId);
    }
  };


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
  
  const handleAnalyzeText = async (questionId: string) => {
    setProcessedResults(prev => ({
        ...prev,
        [questionId]: {...prev[questionId], isAnalyzing: true, textAnalysis: null }
    }));

    const questionData = processedResults[questionId];
    const formData = new FormData();
    formData.append('question', questionData.title);
    formData.append('responses', JSON.stringify(questionData.data));

    const result = await analyzeText(formData);

    if (result.success) {
       setProcessedResults(prev => ({
        ...prev,
        [questionId]: {...prev[questionId], isAnalyzing: false, textAnalysis: result.analysis }
       }));
    } else {
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: result.error,
      });
       setProcessedResults(prev => ({
        ...prev,
        [questionId]: {...prev[questionId], isAnalyzing: false }
       }));
    }
  }
  
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
  
  const getAnalysisOptions = (type: string): { value: AnalysisType, label: string, icon: React.ElementType }[] => {
    switch (type) {
        case 'rating':
        case 'multiple-choice':
        case 'yesNo':
        case 'dropdown':
            return [
                { value: 'bar-chart', label: 'Frequency Bar Chart', icon: BarChartIcon },
                { value: 'pie-chart', label: 'Proportion Pie Chart', icon: PieChartIcon },
            ];
        case 'text':
            return [
                { value: 'text-analysis', label: 'AI Sentiment & Thematic Analysis', icon: Lightbulb },
                { value: 'raw-text', label: 'View Raw Responses', icon: FileText }
            ];
        default:
            return [];
    }
  };

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
                    Generate Full Report
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
        const analysisOptions = getAnalysisOptions(result.type);
        
        const sentimentData = result.textAnalysis ? [
            { name: 'Positive', value: result.textAnalysis.sentiment.positivePercentage, fill: sentimentColors.positive },
            { name: 'Negative', value: result.textAnalysis.sentiment.negativePercentage, fill: sentimentColors.negative },
            { name: 'Neutral', value: result.textAnalysis.sentiment.neutralPercentage, fill: sentimentColors.neutral },
        ] : [];
        
        return (
          <Card key={questionId}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Icon className="text-primary"/>{result.title}</CardTitle>
               {analysisOptions.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                        Analyze
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {analysisOptions.map(opt => (
                            <DropdownMenuItem key={opt.value} onClick={() => handleSetAnalysis(questionId, opt.value)}>
                                <opt.icon className="mr-2 h-4 w-4" />
                                {opt.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent>
                {result.selectedAnalysis === 'none' && (
                    <div className="text-center py-10 text-muted-foreground">
                        <p>Select an analysis type to visualize the data.</p>
                    </div>
                )}
                { result.selectedAnalysis === 'bar-chart' && result.data.length > 0 && (
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
                 { result.selectedAnalysis === 'pie-chart' && result.data.length > 0 && (
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--card))'}}/>
                            <Pie
                                data={result.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                dataKey="value"
                            >
                                {result.data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                )}
                {result.isAnalyzing && (
                    <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="ml-4 text-muted-foreground">Performing AI analysis...</p>
                    </div>
                )}
                { result.selectedAnalysis === 'text-analysis' && result.textAnalysis && (
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="text-accent"/>AI Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div>
                            <h4 className="font-semibold flex items-center gap-2 mb-2"><Search/>Thematic Summary</h4>
                            <p className="text-sm text-muted-foreground">{result.textAnalysis.summary}</p>
                        </div>
                            <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Percent/>Sentiment Breakdown</h4>
                                <div className="flex items-center gap-4">
                                    <div className="w-1/2">
                                            <ChartContainer config={{}} className="h-40">
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                                                <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={30} outerRadius={50} strokeWidth={2}>
                                                    {sentimentData.map((entry) => (
                                                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>
                                    </div>
                                    <div className="w-1/2 space-y-2 text-sm">
                                        <div className="flex items-center gap-2"><Smile className="text-green-500"/> Positive: {result.textAnalysis.sentiment.positivePercentage.toFixed(1)}%</div>
                                        <div className="flex items-center gap-2"><Frown className="text-red-500"/> Negative: {result.textAnalysis.sentiment.negativePercentage.toFixed(1)}%</div>
                                        <div className="flex items-center gap-2"><Meh className="text-yellow-500"/> Neutral: {result.textAnalysis.sentiment.neutralPercentage.toFixed(1)}%</div>
                                        <Badge>Overall: {result.textAnalysis.sentiment.overall}</Badge>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-semibold flex items-center gap-2 mb-2"><Tags/>Keywords</h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.textAnalysis.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                                </div>
                            </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
                { result.selectedAnalysis === 'raw-text' && result.data.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Raw Responses</CardTitle>
                            <CardDescription>All individual text answers.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-60 w-full rounded-md border">
                                <div className="p-4 space-y-4">
                                {result.data.map((answer: string, index: number) => (
                                    <div key={index} className="p-3 bg-muted/50 rounded-md text-sm">
                                        {answer}
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                )}
                 {(result.selectedAnalysis === 'bar-chart' || result.selectedAnalysis === 'pie-chart') && result.data.length === 0 && (
                     <div className="text-center py-10 text-muted-foreground">
                        <p>No data available for this visualization.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}

    