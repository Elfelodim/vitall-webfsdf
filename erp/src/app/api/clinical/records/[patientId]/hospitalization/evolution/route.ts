import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ patientId: string }> }
) {
    try {
        const { patientId: patientDocument } = await params;
        const data = await request.json();
        const record = await medicalRecordService.saveEvolution({ ...data, patientDocument });
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Error saving evolution:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
