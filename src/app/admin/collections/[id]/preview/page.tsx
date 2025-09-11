
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSurveyCollectionById, getSurveyById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye, MessageSquare, Pencil, Send, CheckCircle, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { sendSurvey, updateCollectionContent } from '@/lib/actions';
import type { Survey, SurveyCollection } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreviewSurveyPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [collection, setCollection] = useState<SurveyCollection | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const coll = await getSurveyCollectionById(id);
      if (coll) {
        setCollection(coll);
        const surv = await getSurveyById(coll.surveyId);
        if (surv) {
          setSurvey(surv);
          setSponsorMessage(coll.sponsorMessage || '');
          setSponsorSignature(coll.sponsorSignature || '');
        } else {
           notFound();
        }
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(true);

  // State for editable fields
  const [sponsorMessage, setSponsorMessage] = React.useState('');
  const [sponsorSignature, setSponsorSignature] = React.useState('');
  
  const handleSaveChanges = async () => {
    if (!collection) return;
    const result = await updateCollectionContent(collection.id, {
        sponsorMessage,
        sponsorSignature,
    });

    if (result.success) {
        toast({ title: "Changes saved!", description: "The email content has been updated." });
        setIsEditMode(false);
        setIsSaved(true);
    } else {
        toast({ variant: "destructive", title: "Save Failed", description: result.error });
    }
  }

  const handleCancel = () => {
      // Reset state to original collection data
      if (collection) {
        setSponsorMessage(collection.sponsorMessage || '');
        setSponsorSignature(collection.sponsorSignature || '');
      }
      setIsEditMode(false);
      setIsSaved(true); // Since we reverted, it's "saved"
  }

  const handleSendSurvey = async () => {
      if (!collection) return;
      const result = await sendSurvey(collection.id);
      
      if (result.success) {
        toast({
            title: "Survey Sent!",
            description: `The survey has been dispatched to ${collection.userIds.length} recipients.`,
        });
        router.push('/admin');
      } else {
        toast({
            variant: "destructive",
            title: "Send Failed",
            description: result.error,
        });
      }
  }
  
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setIsSaved(false);
  }

  if (loading || !collection || !survey) {
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Preview & Send</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            Final review for collection: <span className="font-semibold text-primary">{collection.name}</span>
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
            </Link>
            </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>Email & Survey Content</CardTitle>
                    <CardDescription>This is what your users will see. Review carefully before sending.</CardDescription>
                </div>
                 {!isEditMode && (
                    <Button onClick={() => setIsEditMode(true)}>
                        <Edit className="mr-2 h-4 w-4"/>
                        Edit Content
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Survey: {survey.title}</h3>
                <p className="text-muted-foreground">{survey.description}</p>
            </div>
            <Separator/>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold">Sponsor Details</h3>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sponsor Message</Label>
                    <Textarea 
                        value={sponsorMessage}
                        onChange={handleInputChange(setSponsorMessage)}
                        placeholder="e.g., Your feedback is invaluable to us..."
                        rows={4}
                        disabled={!isEditMode}
                        className="disabled:opacity-100 disabled:cursor-text"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Sponsor Signature</Label>
                    <Input 
                        value={sponsorSignature}
                        onChange={handleInputChange(setSponsorSignature)}
                        placeholder="e.g., John Doe, CEO of ExampleCorp"
                        disabled={!isEditMode}
                        className="disabled:opacity-100 disabled:cursor-text"
                    />
                </div>
                 {isEditMode && (
                    <div className="flex gap-2">
                        <Button onClick={handleSaveChanges}>
                            <Save className="mr-2 h-4 w-4" /> Save Changes
                        </Button>
                        <Button onClick={handleCancel} variant="outline">
                            Cancel
                        </Button>
                    </div>
                )}
            </div>
             <Separator/>
             <div className="space-y-4">
                <h3 className="text-xl font-semibold">Survey Questions ({survey.questions.length})</h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto p-4 bg-muted/50 rounded-lg">
                    {survey.questions.map((q, index) => (
                         <div key={q.id}>
                            <p className="font-semibold">{index + 1}. {q.text}</p>
                            <div className="text-sm text-muted-foreground pl-4 mt-1">
                                <div>Type: <Badge variant="secondary">{q.type}</Badge></div>
                                {q.options && <p>Options: {q.options.join(', ')}</p>}
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <div className="flex w-full justify-end">
                 <Button onClick={handleSendSurvey} disabled={isEditMode || !isSaved} size="lg">
                    {isEditMode && <><Edit className="mr-2 h-4 w-4"/> Save to Enable</> }
                    {!isEditMode && !isSaved && <><Save className="mr-2 h-4 w-4"/> Save to Enable</> }
                    {!isEditMode && isSaved && <><Send className="mr-2 h-4 w-4"/> Send Survey to {collection.userIds.length} users</>}
                </Button>
            </div>
        </CardFooter>
      </Card>
    </div>
  );
}
