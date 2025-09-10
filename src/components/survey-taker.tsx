
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
import { Loader2, PartyPopper, Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Checkbox } from './ui/checkbox';

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
        if(q.multiple) {
            acc[q.id] = z.array(z.string()).nonempty('Please select at least one option.');
        } else {
            acc[q.id] = z.string({ required_error: 'Please select an option.' });
        }
        break;
      case 'number':
        acc[q.id] = z.coerce.number().min(q.min ?? -Infinity).max(q.max ?? Infinity, `Value must be less than or equal to ${q.max}`);
        break;
      case 'yesNo':
         acc[q.id] = z.enum(['Yes', 'No'], { required_error: 'Please select Yes or No.'});
        break;
      case 'dropdown':
         acc[q.id] = z.string({ required_error: 'Please select an option.' });
        break;
      case 'date':
          acc[q.id] = z.date({ required_error: 'Please select a date.' });
        break;
       case 'ranking':
        const rankingShape = q.options!.reduce((shape, option) => {
            shape[option] = z.coerce.number().min(1).max(q.options!.length);
            return shape;
        }, {} as Record<string, z.ZodNumber>);
         acc[q.id] = z.object(rankingShape).refine(data => {
            const values = Object.values(data);
            const uniqueValues = new Set(values);
            return values.length === uniqueValues.size;
         }, {message: 'Each rank must be unique.'});
        break;
       case 'matrix':
         const matrixShape = q.rows!.reduce((shape, row) => {
            shape[row] = z.string({required_error: `Please select an option for ${row}.`});
            return shape;
         }, {} as Record<string, z.ZodString>);
         acc[q.id] = z.object(matrixShape);
        break;
      case 'file':
        acc[q.id] = z.any().refine(files => files?.length > 0, 'File is required.');
        break;
    }
    return acc;
  }, {} as Record<string, z.ZodTypeAny>);
  return z.object(schemaObject);
};

export function SurveyTaker({ survey }: { survey: Survey }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  
  // Use a memo to avoid recreating the schema on every render
  const validationSchema = React.useMemo(() => createSchema(survey), [survey]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    register
  } = useForm({
    resolver: zodResolver(validationSchema),
     defaultValues: survey.questions.reduce((acc, q) => {
      if (q.type === 'ranking') {
        acc[q.id] = q.options?.reduce((rAcc, opt) => ({...rAcc, [opt]: '' }), {});
      }
      return acc;
    }, {} as Record<string, any>)
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    // In a real app, file uploads would be handled differently (e.g., uploading to a storage service)
    // For now, we'll just use the file name.
    const processedData = { ...data };
    for (const q of survey.questions) {
        if(q.type === 'file' && processedData[q.id]?.[0]) {
            processedData[q.id] = processedData[q.id][0].name;
        }
    }
    
    const result = await submitResponse(survey.id, processedData);
    if (result.success) {
      setIsSubmitted(true);
    } else {
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: result.error || 'There was an error submitting your response. Please try again.',
      });
    }
     setIsSubmitting(false);
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
          <Label className="text-xl font-semibold flex items-start">
            <span className="text-primary mr-3">{index + 1}.</span>
            {q.text}
            </Label>
          
            {q.type === 'text' && <Controller name={q.id} control={control} render={({ field }) => <Textarea {...field} placeholder="Your answer..." />} />}
            
            {q.type === 'rating' && (
                <Controller name={q.id} control={control} render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-2 pt-2">
                        {Array.from({ length: (q.max ?? 5) - (q.min ?? 1) + 1 }, (_, i) => (q.min ?? 1) + i).map((val) => (
                            <div key={val} className="flex flex-col items-center space-y-2">
                                <RadioGroupItem value={String(val)} id={`${q.id}-${val}`} className="h-6 w-6"/>
                                <Label htmlFor={`${q.id}-${val}`}>{val}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                )} />
            )}

            {q.type === 'multiple-choice' && !q.multiple && (
                 <Controller name={q.id} control={control} render={({ field }) => (
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-2">
                        {q.options?.map((opt) => (
                        <div key={opt} className="flex items-center space-x-3">
                            <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                            <Label htmlFor={`${q.id}-${opt}`} className="font-normal text-base">{opt}</Label>
                        </div>
                        ))}
                    </RadioGroup>
                )} />
            )}
            
            {q.type === 'multiple-choice' && q.multiple && (
                 <Controller
                    name={q.id}
                    control={control}
                    render={({ field }) => (
                        <div className="space-y-2">
                            {q.options?.map((opt) => (
                                <div key={opt} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`${q.id}-${opt}`}
                                        checked={field.value?.includes(opt)}
                                        onCheckedChange={(checked) => {
                                            const currentSelection = field.value || [];
                                            const newSelection = checked
                                                ? [...currentSelection, opt]
                                                : currentSelection.filter((value: string) => value !== opt);
                                            field.onChange(newSelection);
                                        }}
                                    />
                                    <Label htmlFor={`${q.id}-${opt}`} className="font-normal text-base">{opt}</Label>
                                </div>
                            ))}
                        </div>
                    )}
                 />
            )}

            {q.type === 'number' && <Controller name={q.id} control={control} render={({ field }) => <Input type="number" {...field} placeholder={`Enter a number between ${q.min ?? 'any'} and ${q.max ?? 'any'}`} min={q.min} max={q.max}/>} />}
            
            {q.type === 'yesNo' && (
                <Controller name={q.id} control={control} render={({ field }) => (
                     <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <div className="flex items-center space-x-2"><RadioGroupItem value="Yes" id={`${q.id}-yes`}/><Label htmlFor={`${q.id}-yes`}>Yes</Label></div>
                        <div className="flex items-center space-x-2"><RadioGroupItem value="No" id={`${q.id}-no`}/><Label htmlFor={`${q.id}-no`}>No</Label></div>
                    </RadioGroup>
                )} />
            )}

            {q.type === 'dropdown' && (
                 <Controller name={q.id} control={control} render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                        <SelectContent>
                            {q.options?.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 )} />
            )}
            
            {q.type === 'date' && (
                <Controller name={q.id} control={control} render={({ field }) => (
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("w-[280px] justify-start text-left font-normal",!field.value && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                        </PopoverContent>
                    </Popover>
                )}/>
            )}
            
             {q.type === 'file' && (
                <div>
                  <Controller
                    name={q.id}
                    control={control}
                    render={({ field: { onChange, onBlur, name, ref } }) => (
                      <Input
                        type="file"
                        id={q.id}
                        accept={q.accept}
                        onChange={(e) => onChange(e.target.files)}
                        onBlur={onBlur}
                        name={name}
                        ref={ref}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                    )}
                  />
                  <p className="text-sm text-muted-foreground mt-1">Upload a file. Max size 5MB.</p>
                </div>
            )}
            
            {q.type === 'ranking' && (
                <div className="space-y-3">
                    {q.options?.map(opt => (
                        <div key={opt} className="flex items-center gap-4">
                            <Label htmlFor={`${q.id}-${opt}`} className="w-48">{opt}</Label>
                            <Controller name={`${q.id}.${opt}`} control={control} render={({ field }) => (
                               <Input type="number" {...field} id={`${q.id}-${opt}`} min="1" max={q.options?.length} placeholder="Rank"/>
                            )}/>
                        </div>
                    ))}
                </div>
            )}
            
            {q.type === 'matrix' && (
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="text-left"></th>
                            {q.columns?.map(col => <th key={col} className="text-center font-normal text-sm p-2">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                    {q.rows?.map(row => (
                         <tr key={row}>
                            <td className="py-2 pr-4 font-medium">{row}</td>
                             <Controller
                                name={`${q.id}.${row}`}
                                control={control}
                                render={({ field }) => (
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex justify-around items-center">
                                    {q.columns?.map(col => (
                                        <td key={col} className="text-center p-2">
                                            <RadioGroupItem value={col} id={`${q.id}-${row}-${col}`} />
                                        </td>
                                    ))}
                                    </RadioGroup>
                                )}
                            />
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}


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

    