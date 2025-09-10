
'use client';

import { useParams, useRouter } from 'next/navigation';
import { getSurveyCollectionById, getSurveyById } from '@/lib/data';
import { users } from '@/lib/users';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Calendar, CheckCircle, Mail, User, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function EditCollectionPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const collection = getSurveyCollectionById(id);
  
  if (!collection) {
    return notFound();
  }

  const survey = getSurveyById(collection.surveyId);
  const collectionUsers = users.filter(u => collection.userIds.includes(u.id));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collection: {collection.name}</h1>
          <p className="text-muted-foreground">
            Details for this survey collection.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              <div className="text-lg font-bold">{collection.userIds.length} Users</div>
              <p className="text-xs text-muted-foreground">Assigned to this collection</p>
            </CardContent>
          </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Assigned Users</CardTitle>
          <CardDescription>
            The following users are part of this collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {collectionUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-muted rounded-full">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reminder
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
