
'use server';

import 'isomorphic-fetch';
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_GRAPH_CLIENT_ID!,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_GRAPH_TENANT_ID}`,
        clientSecret: process.env.MICROSOFT_GRAPH_CLIENT_SECRET!,
    },
};

const cca = new ConfidentialClientApplication(msalConfig);

async function getGraphToken() {
    try {
        const tokenRequest = {
            scopes: ['https://graph.microsoft.com/.default'],
        };
        const response = await cca.acquireTokenByClientCredential(tokenRequest);
        return response?.accessToken;
    } catch (error) {
        console.error("Error acquiring MS Graph token:", error);
        throw new Error("Failed to get authentication token for MS Graph.");
    }
}

interface EmailPayload {
    to: string;
    subject: string;
    htmlBody: string;
}

export async function sendEmail({ to, subject, htmlBody }: EmailPayload): Promise<{ success: boolean, error?: string }> {
    const accessToken = await getGraphToken();
    if (!accessToken) {
        return { success: false, error: 'Could not authenticate with email service. Check your MSAL configuration in the .env file.' };
    }

    const senderEmail = process.env.MICROSOFT_GRAPH_USER_ID;
    if (!senderEmail) {
        return { success: false, error: 'Sender email address (MICROSOFT_GRAPH_USER_ID) is not configured in the .env file.' };
    }

    const endpoint = `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`;

    const emailMessage = {
        message: {
            subject: subject,
            body: {
                contentType: 'HTML',
                content: htmlBody,
            },
            toRecipients: [
                {
                    emailAddress: {
                        address: to,
                    },
                },
            ],
            isDeliveryReceiptRequested: true,
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailMessage),
        });

        if (response.status === 202) {
            console.log(`Successfully queued email to ${to} for sending.`);
            return { success: true };
        } else {
            const errorBody = await response.json();
            const errorMessage = errorBody?.error?.message || `API responded with status ${response.status}.`;
            const errorCode = errorBody?.error?.code || 'Unknown';
            console.error('Failed to send email:', JSON.stringify(errorBody, null, 2));
            return { success: false, error: `[${errorCode}] ${errorMessage}` };
        }
    } catch (error) {
        console.error("Error sending email via MS Graph:", error);
        return { success: false, error: 'An unexpected error occurred while sending the email.' };
    }
}
