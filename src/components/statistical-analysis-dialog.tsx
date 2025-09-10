
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { runStatisticalTest, StatsResult } from '@/lib/actions';
import type { Survey, SurveyResponse, Question } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TestTube2, BrainCircuit, Check, X, Sigma } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatisticalAnalysisDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  survey: Survey;
  responses: SurveyResponse[];
  question1: Question | null;
  testType: 'chi-square' | 'descriptive';
}

export default function StatisticalAnalysisDialog({ isOpen, onOpenChange, survey, responses, question1, testType }: StatisticalAnalysisDialogProps) {
  const [question2Id, setQuestion2Id] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<StatsResult['result'] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when dialog opens for a new analysis
    if (isOpen) {
      setResult(null);
      setQuestion2Id('');
      // If it's a descriptive test, run it immediately
      if (testType === 'descriptive' && question1) {
        handleRunAnalysis();
      }
    }
  }, [isOpen, question1, testType]);

  const handleRunAnalysis = async () => {
    if (!question1) return;

    if (testType === 'chi-square' && !question2Id) {
      toast({
        variant: 'destructive',
        title: 'Selection Missing',
        description: 'Please select a second question to analyze.',
      });
      return;
    }
    
    setIsLoading(true);
    setResult(null);

    const question2 = survey.questions.find(q => q.id === question2Id);

    const testData: any = {
      testType,
      responses,
      questionId: question1.id, // Pass for both descriptive and as q1
      question1: question1,
      question2: question2,
    };
    
    try {
      const res = await runStatisticalTest(testData);
      if (res.success && res.result) {
        setResult(res.result);
      } else {
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: res.error || 'An unknown error occurred.',
        });
      }
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'An unexpected error occurred during analysis.',
      });
    } finally {
        setIsLoading(false);
    }
  };
  
  const eligibleQuestions = survey.questions.filter(q => 
    q.id !== question1?.id && ['multiple-choice', 'yesNo', 'dropdown'].includes(q.type)
  );

  const renderChiSquareResults = (res: NonNullable<StatsResult['result']>) => {
    if (!res?.chiSquare) return null;
    const { statistic, pValue, isSignificant, interpretation } = res.chiSquare;
    return (
        <>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">P-value</span>
                    <span className="font-bold text-xl">{pValue.toFixed(4)}</span>
                </div>
                <div className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
                    <span className="text-muted-foreground">Chi-Square Statistic</span>
                    <span className="font-bold text-xl">{statistic.toFixed(4)}</span>
                </div>
            </div>
            <div className={`flex items-center gap-2 p-3 rounded-lg ${isSignificant ? 'bg-green-100 dark:bg-green-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                {isSignificant ? <Check className="h-5 w-5 text-green-700 dark:text-green-400"/> : <X className="h-5 w-5 text-amber-700 dark:text-amber-500"/>}
                <p className="text-sm font-medium">
                    Result is {isSignificant ? '' : 'not '}statistically significant at p < 0.05.
                </p>
            </div>
            <div>
                <h4 className="font-semibold mb-1">Interpretation</h4>
                <p className="text-sm text-muted-foreground">{interpretation}</p>
            </div>
        </>
    )
  }

  const renderDescriptiveResults = (res: NonNullable<StatsResult['result']>) => {
      if (!res) return null;
      const { mean, median, mode, range } = res;
      return (
           <div className="grid grid-cols-2 gap-4 text-sm">
                {mean !== undefined && <div className="p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground block">Mean</span><span className="font-bold text-xl">{mean.toFixed(2)}</span></div>}
                {median !== undefined && <div className="p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground block">Median</span><span className="font-bold text-xl">{median}</span></div>}
                {mode !== undefined && <div className="p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground block">Mode</span><span className="font-bold text-xl">{Array.isArray(mode) ? mode.join(', ') : mode}</span></div>}
                {range !== undefined && <div className="p-3 bg-muted/50 rounded-lg"><span className="text-muted-foreground block">Range</span><span className="font-bold text-xl">{range.min} - {range.max}</span></div>}
           </div>
      )
  }

  const getDialogTitle = () => {
    switch(testType) {
        case 'chi-square':
            return 'Run Statistical Analysis: Chi-Square Test';
        case 'descriptive':
            return 'Descriptive Statistics';
        default:
            return 'Statistical Analysis';
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {testType === 'chi-square' ? <TestTube2 /> : <Sigma />}
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {testType === 'chi-square' 
              ? `Select a second categorical question to test for a statistically significant association with "${question1?.text}".`
              : `Showing descriptive statistics for the question: "${question1?.text}"`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {testType === 'chi-square' && (
            <>
              <div>
                <label className="text-sm font-medium">Compare with:</label>
                <Select onValueChange={setQuestion2Id} value={question2Id} disabled={!question1}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                  <SelectContent>
                    {eligibleQuestions.map(q => (
                      <SelectItem key={q.id} value={q.id}>{q.text}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRunAnalysis} disabled={isLoading || !question2Id || !question1}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <BrainCircuit className="mr-2 h-4 w-4"/>}
                Run Chi-Square Test
              </Button>
            </>
          )}
        </div>

        {isLoading && (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Calculating...</p>
            </div>
        )}

        {result && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            {testType === 'chi-square' ? renderChiSquareResults(result) : renderDescriptiveResults(result)}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
