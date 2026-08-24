import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ patientId: string }> } // patientId is now documentNumber in the URL
) {
    try {
        const { patientId: patientDocument } = await params;

        if (!patientDocument) {
            return NextResponse.json(
                { message: 'ID de paciente requerido' },
                { status: 400 }
            );
        }

        const { searchParams } = new URL(request.url);
        const view = searchParams.get('view');

        let data;
        if (view === 'chronology') {
            data = await medicalRecordService.getPatientChronology(patientDocument);
        } else {
            data = await medicalRecordService.getPatientFullHistory(patientDocument);
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in Clinical History GET API:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
