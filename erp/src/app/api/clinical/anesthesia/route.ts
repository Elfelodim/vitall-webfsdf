import { NextResponse } from 'next/server';
import { surgeryService } from '@/lib/services/surgeryService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Assuming body contains surgeryReportId
        const record = await surgeryService.createAnesthesiaRecord(body.surgeryReportId, body);
        return NextResponse.json(record);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating anesthesia record', error }, { status: 500 });
    }
}
