
import { getAllSurveys } from "@/lib/data";
import { CreateCollectionForm } from "./create-collection-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";


export default async function CreateCollectionPage() {
    const surveys = await getAllSurveys();

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
            <CreateCollectionForm surveys={surveys} />
        </div>
    );
}
