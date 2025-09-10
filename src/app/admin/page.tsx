import { surveys, responses, surveyCollections } from "@/lib/data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, MessageSquare, Users, Plus, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const totalSurveys = surveys.length;
  const totalResponses = responses.length;
  const averageResponses =
    totalSurveys > 0 ? (totalResponses / totalSurveys).toFixed(1) : 0;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/20 text-primary rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" /> Manage Users
                </Link>
            </Button>
            <Button asChild size="sm">
                <Link href="/admin/surveys/create">
                  <Plus className="mr-2 h-4 w-4" /> Create Survey
                </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
        </div>
      </header>
      <main className="flex-1 space-y-8 p-4 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Surveys
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSurveys}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Responses
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalResponses}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Responses / Survey
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageResponses}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>All Surveys</CardTitle>
              <CardDescription>
                An overview of all created surveys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/surveys/${survey.id}/results`}
                          className="hover:underline"
                        >
                          {survey.title}
                        </Link>
                      </TableCell>
                      <TableCell>{survey.questions.length}</TableCell>
                      <TableCell>
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Responses</CardTitle>
              <CardDescription>
                The latest responses submitted across all surveys.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey</TableHead>
                    <TableHead>Submitted At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.slice(0, 5).map((response) => {
                    const survey = surveys.find(
                      (s) => s.id === response.surveyId
                    );
                    return (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">
                          {survey?.title || "Unknown Survey"}
                        </TableCell>
                        <TableCell>
                          {new Date(response.submittedAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* New User Management Section */}
        <Card>
          <CardHeader>
            <CardTitle>Manage Survey Collections</CardTitle>
            <CardDescription>
              Create and manage user groups for survey distribution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button asChild size="sm">
                <Link href="/admin/collections/create">
                  <Plus className="mr-2 h-4 w-4" /> Create New Collection
                </Link>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Survey</TableHead>
                  <TableHead>Responses</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {surveyCollections.map((collection) => {
                  const survey = surveys.find(
                    (s) => s.id === collection.surveyId
                  );
                  const responseCount = responses.filter(r => r.surveyId === collection.surveyId && collection.userIds.includes(r.userId)).length;
                  return (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        {collection.name}
                      </TableCell>
                      <TableCell>
                        {survey?.title || "Unknown Survey"}
                      </TableCell>
                      <TableCell>
                        {responseCount} / {collection.userIds.length}
                      </TableCell>
                      <TableCell>{collection.schedule}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            collection.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {collection.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/admin/collections/edit/${collection.id}`}>
                            Edit
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
