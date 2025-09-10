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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { surveys } from "@/lib/data";
import { users } from '@/lib/users';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';


export default function CreateCollectionPage() {
  const [name, setName] = useState('');
  const [surveyId, setSurveyId] = useState('');
  const [userIds, setUserIds] = useState<string[]>([]);
  const [schedule, setSchedule] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would write to your database (e.g., Firestore)
    console.log({
      name,
      surveyId,
      userIds,
      schedule,
      status: new Date(schedule) <= new Date() ? 'active' : 'pending' 
    });
    alert('Collection created! Check console for data.');
    router.push('/admin');
  };

  const handleUserToggle = (userId: string) => {
    setUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
              <Label htmlFor="collection-name">Collection Name</Label>
              <Input
                id="collection-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q3 Product Feedback Group"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="survey-select">Select Survey</Label>
              <Select onValueChange={setSurveyId} required>
                <SelectTrigger id="survey-select">
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
            <div className="space-y-2">
              <Label>Select Users</Label>
              <Card className="p-4 bg-muted/50 max-h-60 overflow-y-auto">
                <div className="space-y-3">
                    {users.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                        <Checkbox
                            id={`user-${user.id}`}
                            checked={userIds.includes(user.id)}
                            onCheckedChange={() => handleUserToggle(user.id)}
                        />
                        <Label htmlFor={`user-${user.id}`} className="font-normal flex flex-col">
                           <span>{user.name}</span>
                           <span className="text-xs text-muted-foreground">{user.email}</span>
                        </Label>
                    </div>
                    ))}
                </div>
              </Card>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-date">Schedule Date</Label>
              <Input
                id="schedule-date"
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
