
import { getAllSurveys } from "@/lib/data";
import { CreateCollectionForm } from "./create-collection-form";
import type { Survey } from "@/lib/types";


export default async function CreateCollectionPage() {
    let surveys: Survey[] = [];
    try {
        surveys = await getAllSurveys();
    } catch (error) {
        console.error("Failed to fetch surveys for collection creation:", error);
        // Page will render with an empty list of surveys
    }

    return (
        <CreateCollectionForm surveys={surveys} />
    );
}

    