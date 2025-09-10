
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSurveyCollectionById, getSurveyById } from '@/lib/data';
import { users as allUsers } from '@/lib/users';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Mail, User, Users, UserPlus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import * as XLSX from 'xlsx';

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
  const [users, setUsers] = useState<User[]>(allUsers.filter(u => collection.userIds.includes(u.id)));
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');

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

  const handleSaveChanges = () => {
     // In a real app, this would write to your database (e.g., Firestore)
    console.log("Saving changes for collection:", collection.name);
    console.log("Updated user list:", users.map(u => u.id));
    alert("Changes saved! Check the console for data.");
  }


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
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
              <CardTitle className="text-sm font-medium">Recipients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{users.length} Users</div>
              <p className="text-xs text-muted-foreground">Assigned to this collection</p>
            </CardContent>
          </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Manage Assigned Users</CardTitle>
          <CardDescription>
            Add or remove users from this collection.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="text-lg font-medium">Add New Users</h3>
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
            </div>
          
            <div>
                <h4 className="text-sm font-medium mb-2">Users in Collection ({users.length})</h4>
                <div className="max-h-60 overflow-y-auto rounded-md border bg-muted/50 p-2 space-y-2">
                    {users.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">No users in this collection.</p>
                    ) : (
                    users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-2 bg-background rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                           <User className="h-5 w-5 text-muted-foreground" />
                           <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveUser(user.id)}>
                            <X className="h-4 w-4 text-destructive"/>
                        </Button>
                      </div>
                    ))
                    )}
                </div>
            </div>
            <Button onClick={handleSaveChanges} size="lg">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
