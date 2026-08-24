import { NextResponse } from 'next/server';
import { surgeryService } from '@/lib/services/surgeryService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const report = await surgeryService.createReport(body);
        return NextResponse.json(report);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error creating surgery report', error }, { status: 500 });
    }
}
