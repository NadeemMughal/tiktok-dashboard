import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        // The user will upload a file and fill in some fields like Platform, Account, Instruction
        const file = formData.get('Upload Image or Video') as Blob;

        if (!file) {
            return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Create axios form data
        const axiosForm = new FormData();
        // append file, platform, etc.
        axiosForm.append('Upload Image or Video', buffer, { filename: (file as any).name || 'upload.mp4', contentType: file.type });

        // Append the other form fields from the original formData
        for (const [key, value] of Array.from(formData.entries())) {
            if (key !== 'Upload Image or Video') {
                axiosForm.append(key, value as string);
            }
        }

        const n8nWebhookUrl = 'https://n8n.srv829343.hstgr.cloud/webhook/45e92613-385d-4684-a649-9b381e26bab7';

        const response = await axios.post(n8nWebhookUrl, axiosForm, {
            headers: {
                ...axiosForm.getHeaders(),
            },
            // You may need timeout adjustments for large files
            timeout: 60000,
        });

        return NextResponse.json({ success: true, data: response.data });
    } catch (error: any) {
        console.error('Webhook Upload Error:', error.message);
        return NextResponse.json({ success: false, error: 'Failed to upload to webhook' }, { status: 500 });
    }
}
