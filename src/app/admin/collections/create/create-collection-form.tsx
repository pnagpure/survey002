
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
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
import { useRouter } from 'next/navigation';
import { UserPlus, X, ShieldCheck, Building2, MessageSquare, Pencil, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { createCollection } from '@/lib/actions';
import type { Survey } from '@/lib/types';
import Link from 'next/link';

// In a real app, you would have a more robust User type and import it
interface User {
  id: string;
  name: string;
  email: string;
}

export function CreateCollectionForm({ surveys }: { surveys: Survey[] }) {
  const [name, setName] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [schedule, setSchedule] = useState('');
  const [cohortType, setCohortType] = useState<'organisation' | 'university' | 'government' | 'general' | ''>('');
  const [logoDataUri, setLogoDataUri] = useState('');
  const [sponsorMessage, setSponsorMessage] = useState('');
  const [sponsorSignature, setSponsorSignature] = useState('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const [newSuperUserName, setNewSuperUserName] = useState('');
  const [newSuperUserEmail, setNewSuperUserEmail] = useState('');
  const [superUsers, setSuperUsers] = useState<User[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  // Handle adding a new respondent manually
  const handleAddRespondent = () => {
    if (newUserName && newUserEmail) {
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: newUserName,
        email: newUserEmail,
      };
      setUsers((prev) => [...prev, newUser]);
      setNewUserName('');
      setNewUserEmail('');
    }
  };
  
  const handleRemoveRespondent = (userId: string) => {
    setUsers((prev) => prev.filter(user => user.id !== userId));
  }

  // Handle adding a new super user manually
  const handleAddSuperUser = () => {
    if (newSuperUserName && newSuperUserEmail) {
      const newSuperUser: User = {
        id: `super-user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: newSuperUserName,
        email: newSuperUserEmail,
      };
      setSuperUsers((prev) => [...prev, newSuperUser]);
      setNewSuperUserName('');
      setNewSuperUserEmail('');
    }
  };
  
  const handleRemoveSuperUser = (userId: string) => {
    setSuperUsers((prev) => prev.filter(user => user.id !== userId));
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Handle Excel file upload for respondents
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
          const newUsers = worksheet.map((row: any) => ({
            id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            name: row.Name || row.name || '',
            email: row.Email || row.email || '',
          })).filter((user: User) => user.name && user.email);
          setUsers((prev) => [...prev, ...newUsers]);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
           toast({
            variant: "destructive",
            title: "File Parse Error",
            description: "Failed to parse the Excel file. Please ensure it's a valid format.",
          });
        }
      };
      reader.readAsBinaryString(file);
      // Reset file input
      event.target.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !surveyId || !schedule || users.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill all fields and add at least one respondent.",
      });
      return;
    };

    const result = await createCollection({
        name,
        surveyId,
        schedule,
        cohortType: cohortType || undefined,
        logoDataUri: logoDataUri || undefined,
        sponsorMessage: sponsorMessage || undefined,
        sponsorSignature: sponsorSignature || undefined,
        respondents: users,
        superUsers: superUsers,
    });

    if (result.success) {
        toast({
            title: "Collection Created!",
            description: "The new survey collection has been saved.",
        });
        router.push('/admin');
    } else {
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: result.error,
        });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Create Survey Collection</h1>
                <p className="text-muted-foreground">
                Group users and schedule a survey for them.
                </p>
            </div>
            <Button asChild variant="outline">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin
                </Link>
            </Button>
        </div>
        <Card>
            <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                <label className="block text-sm font-medium">Collection Name</label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Q3 Product Feedback Group"
                    required
                />
                </div>
                <div className="space-y-2">
                <label className="block text-sm font-medium">Select Survey</label>
                <Select onValueChange={setSurveyId} required>
                    <SelectTrigger>
                    <SelectValue placeholder="Choose a survey" />
                    </SelectTrigger>
                    <SelectContent>
                    {surveys.map((survey) => (
                        <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><Building2 /> Branding & Welcome Page</h3>
                    <p className="text-sm text-muted-foreground">
                        Customize the welcome page for this survey collection.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Cohort Type</Label>
                            <Select onValueChange={(value) => setCohortType(value as any)} value={cohortType}>
                                <SelectTrigger>
                                <SelectValue placeholder="Select cohort type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="organisation">Organisation</SelectItem>
                                    <SelectItem value="university">University</SelectItem>
                                    <SelectItem value="government">Government</SelectItem>
                                    <SelectItem value="general">General Public</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Sponsor Logo</Label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                            {logoDataUri && <Image src={logoDataUri} alt="Logo preview" width={80} height={80} className="mt-2 rounded-lg object-contain" />}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sponsor Message</Label>
                        <Textarea 
                            value={sponsorMessage}
                            onChange={(e) => setSponsorMessage(e.target.value)}
                            placeholder="e.g., Your feedback is invaluable to us..."
                            rows={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Sponsor Signature</Label>
                        <Input 
                            value={sponsorSignature}
                            onChange={(e) => setSponsorSignature(e.target.value)}
                            placeholder="e.g., John Doe, CEO of ExampleCorp"
                        />
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">Manage Respondents</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Respondent Manually</label>
                        <div className="flex items-center gap-2">
                        <Input
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="Respondent Name"
                        />
                        <Input
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                            placeholder="respondent@example.com"
                            type="email"
                        />
                        <Button type="button" onClick={handleAddRespondent} variant="secondary">
                            <UserPlus />
                        </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Or Upload Respondents from Excel</label>
                        <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            accept=".xlsx, .xls"
                            onChange={handleFileUpload}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                        </div>
                        <p className="text-xs text-muted-foreground">File must contain 'Name' and 'Email' columns.</p>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium mb-2">Added Respondents ({users.length})</h4>
                        <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                            {users.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">No respondents added yet.</p>
                            ) : (
                            users.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveRespondent(user.id)}>
                                    <X className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                            ))
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium flex items-center gap-2"><ShieldCheck /> Manage Super Users</h3>
                    <p className="text-sm text-muted-foreground">
                        Super users can view results and perform analytics for this collection.
                    </p>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Super User Manually</label>
                        <div className="flex items-center gap-2">
                        <Input
                            value={newSuperUserName}
                            onChange={(e) => setNewSuperUserName(e.target.value)}
                            placeholder="Super User Name"
                        />
                        <Input
                            value={newSuperUserEmail}
                            onChange={(e) => setNewSuperUserEmail(e.target.value)}
                            placeholder="superuser@example.com"
                            type="email"
                        />
                        <Button type="button" onClick={handleAddSuperUser} variant="secondary">
                            <UserPlus />
                        </Button>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-medium mb-2">Added Super Users ({superUsers.length})</h4>
                        <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                            {superUsers.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">No super users added yet.</p>
                            ) : (
                            superUsers.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSuperUser(user.id)}>
                                    <X className="h-4 w-4 text-destructive"/>
                                </Button>
                            </div>
                            ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                <label className="block text-sm font-medium">Schedule Date</label>
                <Input
                    type="date"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    required
                />
                </div>
                <Button type="submit" size="lg">Create Collection</Button>
            </form>
            </CardContent>
        </Card>
    </div>
  )
}

    