'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, PlusCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['text', 'multiple-choice', 'rating']),
  options: z.array(z.object({ value: z.string().min(1, 'Option cannot be empty') })).optional(),
});

const surveySchema = z.object({
  title: z.string().min(1, 'Survey title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export function SurveyCreator() {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      title: '',
      description: '',
      questions: [{ text: '', type: 'text', options: [] }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = (data: SurveyFormValues) => {
    // In a real app, you would save this to a database
    console.log('Survey Created:', JSON.stringify(data, null, 2));
    alert('Survey created successfully! Check the console for the data.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg font-medium">Survey Title</Label>
        <Input id="title" {...register('title')} placeholder="e.g., Customer Satisfaction Survey" />
        {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-lg font-medium">Description</Label>
        <Textarea id="description" {...register('description')} placeholder="A brief description of your survey" />
      </div>

      <div className="space-y-6">
        <Label className="text-lg font-medium">Questions</Label>
        {fields.map((field, index) => {
          const questionType = watch(`questions.${index}.type`);
          return (
            <div key={field.id} className="p-6 border rounded-lg bg-muted/30 space-y-4 relative">
              <div className="space-y-2">
                <Label htmlFor={`questions.${index}.text`}>Question {index + 1}</Label>
                <Input
                  id={`questions.${index}.text`}
                  {...register(`questions.${index}.text`)}
                  placeholder="What would you like to ask?"
                />
                 {errors.questions?.[index]?.text && <p className="text-sm text-destructive">{errors.questions?.[index]?.text?.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Question Type</Label>
                <Controller
                  name={`questions.${index}.type`}
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                        <SelectItem value="rating">Rating (1-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {questionType === 'multiple-choice' && (
                <OptionsFieldArray control={control} nestIndex={index} />
              )}
               <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => remove(index)}
                className="absolute top-4 right-4 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        {errors.questions?.root && <p className="text-sm text-destructive">{errors.questions.root.message}</p>}

        <Button type="button" variant="outline" onClick={() => append({ text: '', type: 'text', options: [] })}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Question
        </Button>
      </div>

      <Button type="submit" size="lg">Create Survey</Button>
    </form>
  );
}

function OptionsFieldArray({ nestIndex, control }: { nestIndex: number, control: any }) {
  const { fields, remove, append } = useFieldArray({
    control,
    name: `questions.${nestIndex}.options`,
  });

  return (
    <div className="space-y-3 pl-4 border-l">
      <Label>Options</Label>
      {fields.map((item, k) => (
        <div key={item.id} className="flex items-center gap-2">
          <Input {...control.register(`questions.${nestIndex}.options.${k}.value`)} placeholder={`Option ${k + 1}`} />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(k)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" size="sm" onClick={() => append({ value: '' })}>
        <PlusCircle className="mr-2 h-4 w-4" /> Add Option
      </Button>
    </div>
  );
}
