
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users } from "@/lib/users";
import { PlusCircle, Send, Users } from "lucide-react";
import { AddUserDialog } from "./_components/add-user-dialog";
import { AssignSurveyMenu } from "./_components/assign-survey-menu";
import { Badge } from "@/components/ui/badge";
import { getSurveyById } from "@/lib/data";

export default function AdminUsersPage() {

  const getAssignedSurvey = (userId: string) => {
    // In a real app, this would be a database lookup.
    // For now, we'll simulate some users having assignments.
    const assignments: Record<string, string | undefined> = {
      'user-1': 'product-feedback-2024',
      'user-3': 'workplace-satisfaction-q2'
    }
    const surveyId = assignments[userId];
    return surveyId ? getSurveyById(surveyId) : null;
  }

  const getStatus = (userId: string) => {
    const statuses: Record<string, string> = {
      'user-1': 'Completed',
      'user-3': 'Sent'
    }
    return statuses[userId] || 'Not Sent';
  }


  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Add, assign, and manage survey participants.
          </p>
        </div>
        <AddUserDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Survey</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const assignedSurvey = getAssignedSurvey(user.id);
                const status = getStatus(user.id);
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{assignedSurvey?.title || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={status === 'Completed' ? 'default' : 'secondary'}>{status}</Badge>
                    </TableCell>
                    <TableCell className="text-right flex gap-2 justify-end">
                      <AssignSurveyMenu />
                      <Button variant="outline" size="sm" disabled={status !== 'Sent'}>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reminder
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
