'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { runStatisticalTest } from '@/lib/actions';
import type { Survey, SurveyResponse, Question } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TestTube2, BrainCircuit, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatisticalAnalysisDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  survey: Survey;
  responses: SurveyResponse[];
  question1: Question | null;
  testType: 'chi-square'; // Expandable for other tests
}

export default function StatisticalAnalysisDialog({ isOpen, onOpenChange, survey, responses, question1, testType }: StatisticalAnalysisDialogProps) {
  const [question2Id, setQuestion2Id] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Reset state when the dialog is opened with a new question
    if (isOpen) {
        setQuestion2Id('');
        setResult(null);
    }
  }, [isOpen, question1]);

  const handleRunAnalysis = async () => {
    if (!question1 || !question2Id) {
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
    if (!question2) {
      setIsLoading(false);
      return;
    }

    const testData = {
        testType,
        question1: {id: question1.id, text: question1.text, type: question1.type},
        question2: {id: question2.id, text: question2.text, type: question2.type},
        responses: JSON.stringify(responses.map(r => r.answers))
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
    } catch(e) {
        console.error(e);
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'An unexpected error occurred while running the test.',
        });
    }

    setIsLoading(false);
  };
  
  const eligibleQuestions = survey.questions.filter(q => 
    q.id !== question1?.id && ['multiple-choice', 'yesNo', 'dropdown'].includes(q.type)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TestTube2 />
            Run Statistical Analysis: Chi-Square Test
          </DialogTitle>
          <DialogDescription>
            Select a second categorical question to test for a statistically significant association with "{question1?.text}".
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
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
                Run Analysis
            </Button>
        </div>

        {result && (
            <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Analysis Results</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">P-value</span>
                        <span className="font-bold text-xl">{result.p_value.toFixed(4)}</span>
                    </div>
                     <div className="flex flex-col space-y-1 p-3 bg-muted/50 rounded-lg">
                        <span className="text-muted-foreground">Chi-Square Statistic</span>
                        <span className="font-bold text-xl">{result.statistic.toFixed(4)}</span>
                    </div>
                 </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${result.is_significant ? 'bg-green-100 dark:bg-green-900/50' : 'bg-amber-100 dark:bg-amber-900/50'}`}>
                    {result.is_significant ? <Check className="h-5 w-5 text-green-700 dark:text-green-400"/> : <X className="h-5 w-5 text-amber-700 dark:text-amber-500"/>}
                    <p className="text-sm font-medium">
                        Result is {result.is_significant ? '' : 'not '}statistically significant at p < 0.05.
                    </p>
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Interpretation</h4>
                    <p className="text-sm text-muted-foreground">{result.interpretation}</p>
                 </div>
            </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
