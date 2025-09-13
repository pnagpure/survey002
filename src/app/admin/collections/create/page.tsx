
import { getAllSurveys } from "@/lib/data";
import { CreateCollectionForm } from "./create-collection-form";
import type { Survey } from "@/lib/types";


export default async function CreateCollectionPage() {
    const surveys = await getAllSurveys();

    return (
        <CreateCollectionForm surveys={surveys} />
    );
}

    