
# Root Cause Analysis & Solution: Email Delivery Failures

This document outlines the root cause and solution for a persistent issue where survey emails were not being delivered to recipients, despite the UI showing a success message.

## 1. Problem Description

When an administrator used the "Send Survey" button in the application's admin panel, the system would indicate that the survey was sent successfully. However, neither the survey respondents nor the super-users would receive any emails.

A direct `curl` test to the `/api/send-email` endpoint confirmed that the core Microsoft Graph API integration and the `sendEmail` function in `src/lib/email.ts` were working correctly, successfully delivering emails when invoked directly. This isolated the problem to the business logic that orchestrates the sending process, specifically the `sendSurvey` server action located in `src/lib/actions.ts`.

## 2. Root Cause

The investigation revealed that the `sendSurvey` server action contained critical asynchronous programming errors. The function calls other `async` functions to fetch data from the database but was not using the `await` keyword to wait for the results.

Specifically, these two lines were the source of the failure:

1.  **Fetching the Collection**: `const collectionData = getSurveyCollectionById(collectionId);`
2.  **Fetching User Details**: `const user = getUserById(userId);` (inside a loop)

Because `getSurveyCollectionById` and `getUserById` are asynchronous functions that return a `Promise`, the variables `collectionData` and `user` were being assigned the `Promise` object itself, not the resolved data (the collection object or the user object).

The code then attempted to access properties like `collectionData.userIds` and `user.email`. Since a `Promise` object does not have these properties, their values were `undefined`. The `sendEmail` function was subsequently called with `undefined` parameters. It did not throw a fatal error but simply failed to send an email, leading the `sendSurvey` action to incorrectly report a successful operation.

## 3. Solution

The solution was to correctly handle the asynchronous nature of the database calls by adding the `await` keyword where it was missing in `src/lib/actions.ts`.

The following changes were implemented in the `sendSurvey` function:

1.  **Awaited the collection data**:
    ```typescript
    // Before
    const collectionData = getSurveyCollectionById(collectionId);

    // After
    const collectionData = await getSurveyCollectionById(collectionId);
    ```

2.  **Awaited the user data within the loops**:
    ```typescript
    // Before (for both respondents and super-users)
    const user = getUserById(userId);

    // After
    const user = await getUserById(userId);
    ```

By ensuring that the code waits for the database queries to complete and return the actual data, the `sendEmail` function subsequently received the correct user details (`name` and `email`) and was able to dispatch the emails successfully.

## 4. Key Takeaway

This issue serves as a critical reminder of the importance of correctly handling asynchronous operations in JavaScript/TypeScript. When working with `async` functions, always ensure that their returned `Promise` is resolved using `await` before attempting to access the resulting data. Failing to do so can lead to subtle bugs that don't throw immediate errors but cause silent failures in downstream logic.
