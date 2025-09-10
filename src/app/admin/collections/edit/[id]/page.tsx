
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSurveyCollectionById, getSurveyById, responses as allResponses } from '@/lib/data';
import { users as allUsers } from '@/lib/users';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Building2, Calendar, CheckCircle, Mail, User, Users, UserPlus, X, Send, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// In a real app, you would have a more robust User type and import it
interface User {
  id: string;
  name: string;
  email: string;
}

export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const collection = getSurveyCollectionById(id);
  
  if (!collection) {
    return notFound();
  }

  const survey = getSurveyById(collection.surveyId);

  // State for user management
  const [respondents, setRespondents] = useState<User[]>(allUsers.filter(u => collection.userIds.includes(u.id)));
  const [superUserIds, setSuperUserIds] = useState<string[]>(collection.superUserIds || []);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [cohortType, setCohortType] = useState(collection.cohortType || '');
  const [logoUrl, setLogoUrl] = useState(collection.logoUrl || '');

  // Handle adding a new user manually
  const handleAddRespondent = () => {
    if (newUserName && newUserEmail) {
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: newUserName,
        email: newUserEmail,
      };
      setRespondents((prev) => [...prev, newUser]);
      setNewUserName('');
      setNewUserEmail('');
    }
  };
  
  const handleRemoveRespondent = (userId: string) => {
    setRespondents((prev) => prev.filter(user => user.id !== userId));
  }
  
  const handleSuperUserToggle = (userId: string) => {
    setSuperUserIds((prev) => 
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Handle Excel file upload
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
          setRespondents((prev) => [...prev, ...newUsers]);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          alert("Failed to parse the Excel file. Please ensure it's a valid format.");
        }
      };
      reader.readAsBinaryString(file);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleSaveChanges = () => {
     // In a real app, this would write to your database (e.g., Firestore)
    console.log("Saving changes for collection:", collection.name);
    console.log("Updated cohortType:", cohortType);
    console.log("Updated logoUrl:", logoUrl);
    console.log("Updated respondent list:", respondents.map(u => u.id));
    console.log("Updated super user list:", superUserIds);
    alert("Changes saved! Check the console for data.");
  }

  const hasUserResponded = (userId: string, surveyId: string) => {
    return allResponses.some(response => response.userId === userId && response.surveyId === surveyId);
  }

  const assignedSuperUsers = allUsers.filter(u => superUserIds.includes(u.id));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection: {collection.name}</h1>
          <p className="text-muted-foreground">
            View and manage this survey collection.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
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
                Add or remove respondents from this collection.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="text-lg font-medium">Add New Respondents</h3>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add User Manually</label>
                        <div className="flex items-center gap-2">
                        <Input
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                            placeholder="User Name"
                        />
                        <Input
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
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
                                                <Button variant="ghost" size="sm">
                                                    <Send className="mr-2 h-4 w-4"/>
                                                    Send Reminder
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleRemoveRespondent(user.id)}
                                                disabled={hasResponded}
                                            >
                                                <X className="h-4 w-4 text-destructive"/>
                                            </Button>
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
                        Customize the welcome page for this collection.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Cohort Type</Label>
                        <Select onValueChange={(value) => setCohortType(value)} value={cohortType}>
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
                        <Label>Logo URL (Optional)</Label>
                        <Input
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ShieldCheck /> Manage Super Users</CardTitle>
                    <CardDescription>
                        Super users can view results and analytics.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                        {allUsers.map(user => (
                             <Label key={user.id} htmlFor={`super-user-${user.id}`} className="flex items-center justify-between p-3 bg-muted/30 rounded-md shadow-sm hover:bg-muted/60 cursor-pointer transition-colors">
                                <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <Checkbox
                                    id={`super-user-${user.id}`}
                                    checked={superUserIds.includes(user.id)}
                                    onCheckedChange={() => handleSuperUserToggle(user.id)}
                                />
                            </Label>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>

      <div className="mt-8">
        <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
      </div>
    </div>
  );
}
