import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';

export async function POST(
    request: Request,
    { params }: { params: { patientId: string } }
) {
    try {
        const data = await request.json();
        const record = await medicalRecordService.saveEpicrisis(data);
        return NextResponse.json(record);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
