
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Trash2, ArrowLeft, Download, Upload } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import * as XLSX from 'xlsx';
import type { Question } from '@/lib/types';


export default function CreateSurveyPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const router = useRouter();

  const addQuestion = (type: string) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      text: '',
      type: type as any,
      ...(type === 'multiple-choice' || type === 'ranking' || type === 'dropdown' ? { options: [''] } : {}),
      ...(type === 'rating' ? { min: 1, max: 5 } : {}),
      ...(type === 'number' ? { min: 0, max: 100 } : {}),
    };
    setQuestions([...questions, newQuestion]);
  };
  
  const updateQuestion = (index: number, key: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    (updatedQuestions[index] as any)[key] = value;
    setQuestions(updatedQuestions);
  }

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options) {
      updatedQuestions[qIndex].options![oIndex] = value;
      setQuestions(updatedQuestions);
    }
  }

  const addOption = (qIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options) {
      updatedQuestions[qIndex].options!.push('');
      setQuestions(updatedQuestions);
    }
  }
  
  const removeOption = (qIndex: number, oIndex: number) => {
     const updatedQuestions = [...questions];
    if (updatedQuestions[qIndex].options) {
       updatedQuestions[qIndex].options!.splice(oIndex, 1);
       setQuestions(updatedQuestions);
    }
  }
  
  const removeQuestion = (index: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          
          const newQuestions = worksheet.map((row: any) => {
            const question: Question = {
              id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              type: row.type,
              text: row.text,
              options: typeof row.options === 'string' ? row.options.split(',').map(o => o.trim()) : undefined,
              min: row.min,
              max: row.max,
              multiple: row.multiple === true || row.multiple === 'true',
              rows: typeof row.rows === 'string' ? row.rows.split(',').map(o => o.trim()) : undefined,
              columns: typeof row.columns === 'string' ? row.columns.split(',').map(o => o.trim()) : undefined,
              accept: row.accept,
            };
            return question;
          }).filter(q => q.type && q.text); // Basic validation
          
          setQuestions(prev => [...prev, ...newQuestions]);
          alert(`${newQuestions.length} questions imported successfully!`);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Failed to parse the Excel file. Please ensure it's a valid format and matches the template.");
        }
      };
      reader.readAsBinaryString(file);
      event.target.value = '';
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      { 
        type: 'text', text: 'What is your primary hobby?', 
        options: '', min: '', max: '', multiple: '', rows: '', columns: '', accept: '' 
      },
      { 
        type: 'multiple-choice', text: 'Which of these colors do you like?', 
        options: 'Red, Green, Blue', min: '', max: '', multiple: 'true', rows: '', columns: '', accept: '' 
      },
       { 
        type: 'rating', text: 'Rate our service from 1 to 5.', 
        options: '', min: 1, max: 5, multiple: '', rows: '', columns: '', accept: '' 
      },
       { 
        type: 'ranking', text: 'Rank these fruits.', 
        options: 'Apple, Banana, Orange', min: '', max: '', multiple: '', rows: '', columns: '', accept: '' 
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Questions');
    XLSX.writeFile(workbook, 'Survey_Template.xlsx');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || questions.length === 0) {
        alert("Please provide a title and at least one question.");
        return;
    };
    // In a real app, this would save to a database
    console.log('Survey Created:', JSON.stringify({ title, description, questions }, null, 2));
    alert('Survey created successfully! Check the console for the data.');
    router.push('/admin');
  };

  return (
     <div className="max-w-4xl mx-auto p-4 md:p-8">
       <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Create a New Survey</h1>
            <p className="text-muted-foreground">
            Build your survey with advanced question types.
            </p>
        </div>
        <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
            </Link>
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
              <CardTitle>Survey Details</CardTitle>
              <CardDescription>Start by giving your survey a title and description.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="space-y-2">
                  <label className="text-lg font-medium">Survey Title</label>
                  <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Q3 Employee Feedback"
                  required
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-lg font-medium">Description</label>
                  <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your survey"
                  />
              </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Import from Excel</CardTitle>
                <CardDescription>Quickly add questions by uploading an Excel file. This will append questions to your current list.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <div className="flex-1">
                     <Input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      />
                </div>
                <Button type="button" variant="secondary" onClick={handleDownloadTemplate}>
                    <Download className="mr-2 h-4 w-4" />
                    Download Template
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Manually add and configure questions below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {questions.map((q, qIndex) => (
                    <div key={q.id} className="p-6 border rounded-lg bg-muted/30 space-y-4 relative">
                        <Button type="button" variant="destructive" size="icon" onClick={() => removeQuestion(qIndex)} className="absolute top-4 right-4 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                         <div className="space-y-2">
                            <label className="font-medium">Question {qIndex + 1}: {q.type}</label>
                            <Textarea
                                value={q.text}
                                onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                placeholder="What would you like to ask?"
                                required
                            />
                        </div>
                        
                        {(q.type === 'multiple-choice' || q.type === 'dropdown' || q.type === 'ranking') && (
                            <div className="space-y-3 pl-4 border-l">
                                <label className="font-medium">Options</label>
                                {q.options?.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center gap-2">
                                        <Input value={opt} onChange={(e) => updateOption(qIndex, oIndex, e.target.value)} placeholder={`Option ${oIndex + 1}`} />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(qIndex, oIndex)}>
                                            <Trash2 className="h-4 w-4 text-destructive"/>
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" variant="secondary" size="sm" onClick={() => addOption(qIndex)}> <PlusCircle className="mr-2 h-4 w-4"/> Add Option </Button>
                            </div>
                        )}
                        {q.type === 'rating' && (
                             <div className="flex items-center gap-4">
                                <Input type="number" value={q.min} onChange={(e) => updateQuestion(qIndex, 'min', parseInt(e.target.value))} placeholder="Min" />
                                <span>-</span>
                                <Input type="number" value={q.max} onChange={(e) => updateQuestion(qIndex, 'max', parseInt(e.target.value))} placeholder="Max" />
                            </div>
                        )}
                        {q.type === 'number' && (
                             <div className="flex items-center gap-4">
                                <Input type="number" value={q.min} onChange={(e) => updateQuestion(qIndex, 'min', parseInt(e.target.value))} placeholder="Min Value" />
                                 <span>-</span>
                                <Input type="number" value={q.max} onChange={(e) => updateQuestion(qIndex, 'max', parseInt(e.target.value))} placeholder="Max Value" />
                            </div>
                        )}
                    </div>
                ))}

                 <div className="border-t pt-4">
                    <Select onValueChange={(value) => addQuestion(value)}>
                        <SelectTrigger><SelectValue placeholder="Add a new question..." /></SelectTrigger>
                        <SelectContent>
                             <SelectItem value="text">Text</SelectItem>
                             <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                             <SelectItem value="rating">Rating (1-5)</SelectItem>
                             <SelectItem value="number">Numerical Input</SelectItem>
                             <SelectItem value="yesNo">Yes/No</SelectItem>
                             <SelectItem value="dropdown">Dropdown</SelectItem>
                             <SelectItem value="matrix">Matrix/Rating Grid</SelectItem>
                             <SelectItem value="date">Date Picker</SelectItem>
                             <SelectItem value="file">File Upload</SelectItem>
                             <SelectItem value="ranking">Ranking</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </CardContent>
        </Card>

        <Button type="submit" size="lg">Create Survey</Button>
      </form>
    </div>
  );
}
