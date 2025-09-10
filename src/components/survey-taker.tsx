'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Survey } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { submitResponse } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PartyPopper } from 'lucide-react';

const createSchema = (survey: Survey) => {
  const schemaObject = survey.questions.reduce((acc, q) => {
    switch (q.type) {
      case 'text':
        acc[q.id] = z.string().min(1, 'This field is required.');
        break;
      case 'rating':
        acc[q.id] = z.string().min(1, 'Please select a rating.');
        break;
      case 'multiple-choice':
        acc[q.id] = z.string({ required_error: 'Please select an option.' });
        break;
    }
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);
  return z.object(schemaObject);
};

export function SurveyTaker({ survey }: { survey: Survey }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const validationSchema = createSchema(survey);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = async (data: any) => {
    const result = await submitResponse(survey.id, data);
    if (result.success) {
      setIsSubmitted(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'There was an error submitting your response. Please try again.',
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <PartyPopper className="h-16 w-16 mx-auto text-primary" />
        <h2 className="mt-4 text-2xl font-bold">Thank You!</h2>
        <p className="mt-2 text-muted-foreground">Your response has been recorded.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {survey.questions.map((q, index) => (
        <div key={q.id} className="space-y-4 border-l-2 border-primary/50 pl-6 py-2">
          <Label className="text-xl font-semibold flex items-center">
            <span className="text-primary mr-3">{index + 1}.</span>
            {q.text}
            </Label>
          <Controller
            name={q.id}
            control={control}
            render={({ field }) => (
              <>
                {q.type === 'text' && (
                  <Textarea {...field} placeholder="Your answer..." />
                )}
                {q.type === 'rating' && (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-2 pt-2"
                  >
                    {[1, 2, 3, 4, 5].map((val) => (
                      <div key={val} className="flex flex-col items-center space-y-2">
                        <RadioGroupItem value={String(val)} id={`${q.id}-${val}`} className="h-6 w-6"/>
                        <Label htmlFor={`${q.id}-${val}`}>{val}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                {q.type === 'multiple-choice' && (
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="space-y-2"
                  >
                    {q.options?.map((opt) => (
                      <div key={opt} className="flex items-center space-x-3">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                        <Label htmlFor={`${q.id}-${opt}`} className="font-normal text-base">{opt}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </>
            )}
          />
          {errors[q.id] && <p className="text-sm text-destructive">{String(errors[q.id]?.message)}</p>}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting} size="lg" className="w-full mt-10">
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Submit Response
      </Button>
    </form>
  );
}
