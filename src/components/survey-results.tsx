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
import { Bot, Loader2, FileText, BarChart2 as BarChartIcon, Star, MessageSquare, Lightbulb, Search, Tags, Percent, Smile, Frown, Meh, ChevronDown } from 'lucide-react';
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

type AnalysisType = 'bar-chart' | 'text-analysis' | 'raw-text' | 'none';

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

            if (questionType === 'rating') {
                const ratingCounts = Array.from({length: (q.max ?? 5) - (q.min ?? 1) + 1}, (_, i) => (q.min ?? 1) + i).map(rating => ({
                    name: `${rating} Star${rating > 1 ? 's' : ''}`,
                    value: responses.filter(r => r.answers[q.id] === rating || String(r.answers[q.id]) === String(rating)).length,
                }));
                acc[q.id] = { ...common, type: 'rating', data: ratingCounts };
            } else if (questionType === 'multiple-choice' && q.options) {
                 const getAnswers = (r: SurveyResponse) => {
                    const answer = r.answers[q.id];
                    return Array.isArray(answer) ? answer : [answer];
                };
                const optionCounts = q.options.map(option => ({
                    name: option,
                    value: responses.flatMap(getAnswers).filter(ans => ans === option).length,
                }));
                acc[q.id] = { ...common, type: 'multiple-choice', data: optionCounts };
            } else if (questionType === 'text') {
                const textAnswers = responses.map(r => r.answers[q.id]).filter(Boolean);
                acc[q.id] = { ...common, type: 'text', data: textAnswers };
            } else if (questionType === 'yesNo') {
                 const yesNoCounts = ['Yes', 'No'].map(option => ({
                    name: option,
                    value: responses.filter(r => r.answers[q.id] === option).length,
                }));
                acc[q.id] = { ...common, type: 'yesNo', data: yesNoCounts };
            } else if (questionType === 'dropdown' && q.options) {
                const optionCounts = q.options.map(option => ({
                    name: option,
                    value: responses.filter(r => r.answers[q.id] === option).length,
                }));
                acc[q.id] = { ...common, type: 'dropdown', data: optionCounts };
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
  
  const getAnalysisOptions = (type: string): { value: AnalysisType, label: string }[] => {
    switch (type) {
        case 'rating':
        case 'multiple-choice':
        case 'yesNo':
        case 'dropdown':
            return [{ value: 'bar-chart', label: 'Frequency Bar Chart' }];
        case 'text':
            return [
                { value: 'text-analysis', label: 'AI Sentiment & Thematic Analysis' },
                { value: 'raw-text', label: 'View Raw Responses' }
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
                        Choose Analysis
                        <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        {analysisOptions.map(opt => (
                            <DropdownMenuItem key={opt.value} onClick={() => handleSetAnalysis(questionId, opt.value)}>
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
            </CardContent>
          </Card>
        )
      })}
    </div>
  );
}
