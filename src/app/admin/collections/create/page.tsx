
'use client';

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { surveys } from "@/lib/data"; // In a real app, replace with Firestore query
import { users as allUsers } from "@/lib/users"; // Import all users
import { ArrowLeft, UserPlus, X, ShieldCheck, Building2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// In a real app, you would have a more robust User type and import it
interface User {
  id: string;
  name: string;
  email: string;
}

export default function CreateCollectionPage() {
  const [name, setName] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [schedule, setSchedule] = useState('');
  const [cohortType, setCohortType] = useState<'organisation' | 'university' | 'government' | 'general' | ''>('');
  const [logoUrl, setLogoUrl] = useState('');
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [superUserIds, setSuperUserIds] = useState<string[]>([]);
  
  const router = useRouter();

  // Handle adding a new user manually
  const handleAddUser = () => {
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
  
  const handleRemoveUser = (userId: string) => {
    setUsers((prev) => prev.filter(user => user.id !== userId));
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
          setUsers((prev) => [...prev, ...newUsers]);
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
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !surveyId || !schedule || users.length === 0) {
      alert("Please fill all fields and add at least one user.");
      return;
    };

    // In a real app, this would write to your database (e.g., Firestore)
    console.log("Creating collection with the following data:");
    console.log({
      name,
      surveyId,
      schedule,
      cohortType,
      logoUrl,
      status: new Date(schedule) <= new Date() ? 'active' : 'pending',
      users, // In a real app, you would save user IDs
      superUserIds,
    });

    alert('Collection created successfully! Check the console for data.');
    router.push('/admin');
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
                <h3 className="text-lg font-medium flex items-center gap-2"><Building2 /> Branding</h3>
                 <p className="text-sm text-muted-foreground">
                    Customize the welcome page for this survey collection.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Label>Logo URL (Optional)</Label>
                        <Input
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                            placeholder="https://example.com/logo.png"
                        />
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-medium">Manage Respondents</h3>
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
                      <Button type="button" onClick={handleAddUser} variant="secondary">
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
                
                 <div>
                    <h4 className="text-sm font-medium mb-2">Added Respondents ({users.length})</h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                        {users.length === 0 ? (
                        <p className="text-sm text-center text-muted-foreground py-4">No users added yet.</p>
                        ) : (
                        users.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
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
                 <div>
                    <h4 className="text-sm font-medium mb-2">Select Super Users</h4>
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                        {allUsers.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-4">No users available in the system.</p>
                        ) : (
                        allUsers.map((user) => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                              <Label htmlFor={`super-user-${user.id}`} className="flex items-center gap-3 w-full cursor-pointer">
                                <Checkbox
                                    id={`super-user-${user.id}`}
                                    checked={superUserIds.includes(user.id)}
                                    onCheckedChange={() => handleSuperUserToggle(user.id)}
                                />
                                 <div>
                                    <p className="font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </Label>
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
  );
}
