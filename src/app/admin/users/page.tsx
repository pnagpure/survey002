
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers } from "@/lib/data";
import { Users, ArrowLeft, Trash2 } from "lucide-react";
import { AddUserDialog } from "./_components/add-user-dialog";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { deleteUser } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function AdminUsersPage() {
  const users = getAllUsers();
  const { toast } = useToast();

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if(result.success) {
        toast({ title: 'User Deleted', description: 'The user has been removed from the system.' });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
       <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-2">
             <div className="p-2 bg-primary/20 text-primary rounded-lg">
                <Users className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          </div>
           <div className="ml-auto flex items-center gap-2">
              <Button asChild variant="outline">
                <Link href="/admin">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Admin
                </Link>
             </Button>
             <AddUserDialog />
           </div>
      </header>
    <main className="flex-1 p-4 md:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Application Administrators</CardTitle>
          <CardDescription>A list of all users with access to the admin panel.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Admin</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user
                                and remove their data from our servers.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
    </div>
  );
}

    