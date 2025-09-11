

'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import React, { useState } from "react";
import { addUser } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";


export function AddUserDialog() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if(!name || !email) {
        toast({ variant: 'destructive', title: 'Missing fields', description: 'Please enter a name and email.' });
        return;
    }
    const result = await addUser({ name, email });

    if(result.success) {
        toast({ title: 'User Added', description: 'The new administrator has been added.' });
        setName('');
        setEmail('');
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the user's details below. They will be added to the system and can be assigned a survey.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" placeholder="John Doe" className="col-span-3" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input id="email" type="email" placeholder="john.doe@example.com" className="col-span-3" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSubmit}>Save User</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    