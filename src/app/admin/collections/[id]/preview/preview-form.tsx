
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, MessageSquare, Pencil, Send, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { sendSurvey, updateCollectionContent } from '@/lib/actions';
import type { Survey, SurveyCollection } from '@/lib/types';

export function PreviewForm({ collection: initialCollection, survey }: { collection: SurveyCollection; survey: Survey }) {
  const router = useRouter();
  const { toast } = useToast();
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(true);

  // State for editable fields
  const [sponsorMessage, setSponsorMessage] = React.useState(initialCollection.sponsorMessage || '');
  const [sponsorSignature, setSponsorSignature] = React.useState(initialCollection.sponsorSignature || '');
  
  const handleSaveChanges = async () => {
    const result = await updateCollectionContent(initialCollection.id, {
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
      setSponsorMessage(initialCollection.sponsorMessage || '');
      setSponsorSignature(initialCollection.sponsorSignature || '');
      setIsEditMode(false);
      setIsSaved(true); // Since we reverted, it's "saved"
  }

  const handleSendSurvey = async () => {
      const result = await sendSurvey(initialCollection.id);
      
      if (result.success) {
        toast({
            title: "Survey Sent!",
            description: `The survey has been dispatched to ${initialCollection.userIds.length} recipients.`,
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

  return (
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
                    {!isEditMode && isSaved && <><Send className="mr-2 h-4 w-4"/> Send Survey to {initialCollection.userIds.length} users</>}
                </Button>
            </div>
        </CardFooter>
      </Card>
  );
}
