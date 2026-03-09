import { NextResponse } from 'next/server';
import axios from 'axios';

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_TABLE_ID || '';
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN || '';

const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// Fetch all records
export async function GET() {
    try {
        const response = await axios.get(AIRTABLE_API_URL, {
            headers: {
                Authorization: `Bearer ${AIRTABLE_TOKEN}`,
            }
        });

        return NextResponse.json({ success: true, data: response.data.records });
    } catch (error: any) {
        console.error('Airtable GET Error:', error.response?.data || error.message);
        return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
    }
}

// Update a record
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, fields } = body;

        if (!id || !fields) {
            return NextResponse.json({ success: false, error: 'Missing id or fields' }, { status: 400 });
        }

        const response = await axios.patch(
            AIRTABLE_API_URL,
            {
                records: [
                    {
                        id: id,
                        fields: fields,
                    },
                ],
            },
            {
                headers: {
                    Authorization: `Bearer ${AIRTABLE_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return NextResponse.json({ success: true, data: response.data.records });
    } catch (error: any) {
        console.error('Airtable PATCH Error:', error.response?.data || error.message);
        return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 500 });
    }
}
