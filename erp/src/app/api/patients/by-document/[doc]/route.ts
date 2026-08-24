import { NextResponse } from 'next/server';
import { patientService } from '@/lib/services/patientService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ doc: string }> }
) {
    try {
        const { doc } = await params;
        const patient = await patientService.getPatientByDocument(doc);
        if (!patient) return NextResponse.json({ message: 'Paciente no encontrado' }, { status: 404 });
        return NextResponse.json(patient);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
