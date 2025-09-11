
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSurveyCollectionById, getSurveyById, getAllResponses, getUserById, getAllUsers } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, CheckCircle, Mail, User, Users, UserPlus, X, Send, ShieldCheck, MessageSquare, Pencil, Edit, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import type { Survey, SurveyCollection, SurveyResponse } from '@/lib/types';
import { updateCollection } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

interface LocalUser {
  id: string;
  name: string;
  email: string;
}

export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  
  const [collection, setCollection] = useState<SurveyCollection | null>(null);
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [allResponses, setAllResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // State for edit mode
  const [isEditMode, setIsEditMode] = React.useState(false);

  const [respondents, setRespondents] = React.useState<LocalUser[]>([]);
  const [superUsers, setSuperUsers] = React.useState<LocalUser[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      const coll = await getSurveyCollectionById(id);
      if (coll) {
          setCollection(coll);
          const [surv, responses, allUsers] = await Promise.all([
              getSurveyById(coll.surveyId),
              getAllResponses(),
              getAllUsers(),
          ]);

          if (surv) setSurvey(surv); else notFound();
          setAllResponses(responses);

          const initialRespondents = await Promise.all(coll.userIds.map(async (userId) => {
              const user = allUsers.find(u => u.id === userId) || await getUserById(userId);
              return {id: userId, name: user?.name || `User ${userId}`, email: user?.email || `user-${userId}@example.com` };
          }));
          setRespondents(initialRespondents);

          const initialSuperUsers = await Promise.all((coll.superUserIds || []).map(async (userId) => {
              const user = allUsers.find(u => u.id === userId) || await getUserById(userId);
              return {id: userId, name: user?.name || `Super User ${userId}`, email: `superuser-${userId}@example.com` };
          }));
          setSuperUsers(initialSuperUsers);

          setCohortType(coll.cohortType || '');
          setLogoDataUri(coll.logoDataUri || '');
          setSponsorMessage(coll.sponsorMessage || '');
          setSponsorSignature(coll.sponsorSignature || '');
      } else {
          notFound();
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  const [newRespondentName, setNewRespondentName] = React.useState('');
  const [newRespondentEmail, setNewRespondentEmail] = React.useState('');
  
  const [newSuperUserName, setNewSuperUserName] = React.useState('');
  const [newSuperUserEmail, setNewSuperUserEmail] = React.useState('');
  
  const [cohortType, setCohortType] = React.useState('');
  const [logoDataUri, setLogoDataUri] = React.useState('');
  const [sponsorMessage, setSponsorMessage] = React.useState('');
  const [sponsorSignature, setSponsorSignature] = React.useState('');

  // Handle adding a new respondent manually
  const handleAddRespondent = () => {
    if (newRespondentName && newRespondentEmail) {
      const newUser: LocalUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: newRespondentName,
        email: newRespondentEmail,
      };
      setRespondents((prev) => [...prev, newUser]);
      setNewRespondentName('');
      setNewRespondentEmail('');
    }
  };
  
  const handleRemoveRespondent = (userId: string) => {
    setRespondents((prev) => prev.filter(user => user.id !== userId));
  }

  // Handle adding a new super user manually
  const handleAddSuperUser = () => {
    if (newSuperUserName && newSuperUserEmail) {
      const newSuperUser: LocalUser = {
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
          })).filter((user: LocalUser) => user.name && user.email);
          setRespondents((prev) => [...prev, ...newUsers]);
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

  const handleSaveChanges = async () => {
    if (!collection) return;
    const result = await updateCollection(collection.id, {
        cohortType: cohortType || undefined,
        logoDataUri: logoDataUri || undefined,
        sponsorMessage: sponsorMessage || undefined,
        sponsorSignature: sponsorSignature || undefined,
        respondents: respondents,
        superUsers: superUsers,
    });

    if (result.success) {
        toast({
            title: "Changes Saved!",
            description: "The collection has been updated.",
        });
        setIsEditMode(false); // Switch back to preview mode
    } else {
         toast({
            variant: "destructive",
            title: "Update Failed",
            description: result.error,
        });
    }
  }

  const handleCancel = () => {
      if(collection) {
        // This part is tricky without re-fetching all users.
        // For now, just reset the editable fields. A full reset might need another fetch.
        setCohortType(collection.cohortType || '');
        setLogoDataUri(collection.logoDataUri || '');
        setSponsorMessage(collection.sponsorMessage || '');
        setSponsorSignature(collection.sponsorSignature || '');
      }
      setIsEditMode(false);
  }

  const hasUserResponded = (userId: string, surveyId: string) => {
    return allResponses.some(response => response.userId === userId && response.surveyId === surveyId);
  }

  if(loading || !collection || !survey) {
      return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            <Skeleton className="h-12 w-1/2" />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
                <Card><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
            </div>
            <Card>
                <CardHeader><Skeleton className="h-8 w-1/3" /></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection: {collection.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            {isEditMode ? <><Edit className="h-4 w-4 text-primary" /> Now in Edit Mode</> : <><Eye className="h-4 w-4" /> Previewing Collection</>}
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
            <Link href="/admin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Admin
            </Link>
            </Button>
            {!isEditMode && (
                <Button onClick={() => setIsEditMode(true)}>
                    <Edit className="mr-2 h-4 w-4"/>
                    Edit Collection
                </Button>
            )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Survey</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{survey?.title || 'Unknown Survey'}</div>
              <p className="text-xs text-muted-foreground line-clamp-2">{survey?.description}</p>
            </CardContent>
         </Card>
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
               <Badge variant={collection.status === "active" ? "default" : "secondary"}>
                {collection.status}
              </Badge>
            </CardHeader>
            <CardContent>
                <div className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                    {collection.schedule}
                </div>
              <p className="text-xs text-muted-foreground">Scheduled Date</p>
            </CardContent>
         </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Respondents</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{respondents.length} Users</div>
              <p className="text-xs text-muted-foreground">Assigned to take the survey</p>
            </CardContent>
          </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <CardHeader>
            <CardTitle>Manage Respondents</CardTitle>
            <CardDescription>
                {isEditMode ? "Add or remove respondents from this collection." : "View respondents assigned to this collection."}
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {isEditMode && (
                    <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                        <h3 className="text-lg font-medium">Add New Respondents</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Add User Manually</label>
                            <div className="flex items-center gap-2">
                            <Input
                                value={newRespondentName}
                                onChange={(e) => setNewRespondentName(e.target.value)}
                                placeholder="User Name"
                            />
                            <Input
                                value={newRespondentEmail}
                                onChange={(e) => setNewRespondentEmail(e.target.value)}
                                placeholder="user@example.com"
                                type="email"
                            />
                            <Button type="button" onClick={handleAddRespondent} variant="secondary">
                                <UserPlus />
                            </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Or Upload from Excel</label>
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
                    </div>
                )}
            
                <div>
                    <h4 className="text-sm font-medium mb-2">Respondents in Collection ({respondents.length})</h4>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {respondents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                                    No users in this collection.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                respondents.map((user) => {
                                    const hasResponded = hasUserResponded(user.id, collection.surveyId);
                                    return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={hasResponded ? "default" : "outline"}>
                                                {hasResponded ? "Responded" : "Pending"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {collection.status === 'active' && !hasResponded && (
                                                <Button variant="ghost" size="sm" disabled={isEditMode}>
                                                    <Send className="mr-2 h-4 w-4"/>
                                                    Send Reminder
                                                </Button>
                                            )}
                                            {isEditMode && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveRespondent(user.id)}
                                                    disabled={hasResponded}
                                                >
                                                    <X className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    )
                                })
                            )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </CardContent>
        </Card>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building2 /> Branding</CardTitle>
                    <CardDescription>
                        {isEditMode ? "Customize the welcome page for this collection." : "Current welcome page configuration."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Cohort Type</Label>
                        <Select onValueChange={(value) => setCohortType(value)} value={cohortType} disabled={!isEditMode}>
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
                            disabled={!isEditMode}
                        />
                        {logoDataUri && <Image src={logoDataUri} alt="Logo preview" width={80} height={80} className="mt-2 rounded-lg object-contain" />}
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Sponsor Message</Label>
                        <Textarea 
                            value={sponsorMessage}
                            onChange={(e) => setSponsorMessage(e.target.value)}
                            placeholder="e.g., Your feedback is invaluable to us..."
                            rows={4}
                            disabled={!isEditMode}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2"><Pencil className="h-4 w-4" /> Sponsor Signature</Label>
                        <Input 
                            value={sponsorSignature}
                            onChange={(e) => setSponsorSignature(e.target.value)}
                            placeholder="e.g., John Doe, CEO of ExampleCorp"
                             disabled={!isEditMode}
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck /> Manage Super Users</CardTitle>
                    <CardDescription>
                        Super users can view results and analytics for this collection.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isEditMode && (
                        <div className="space-y-2 mb-4">
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
                    )}
                     <h4 className="text-sm font-medium mb-2">Assigned Super Users ({superUsers.length})</h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                        {superUsers.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No super users assigned.</p>
                        ) : (
                        superUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            {isEditMode && (
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveSuperUser(user.id)}>
                                    <X className="h-4 w-4 text-destructive"/>
                                </Button>
                            )}
                          </div>
                        ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

       {isEditMode && (
        <div className="mt-8 flex gap-2">
            <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
            <Button onClick={handleCancel} size="lg" variant="outline">Cancel</Button>
        </div>
       )}
    </div>
  );
}
