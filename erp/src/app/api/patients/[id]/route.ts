import { NextResponse } from 'next/server';
import { patientService } from '@/lib/services/patientService';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        const updatedPatient = await patientService.updatePatient(id, data);
        return NextResponse.json(updatedPatient);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const patient = await patientService.getPatientById(id);
        if (!patient) return NextResponse.json({ message: 'Paciente no encontrado' }, { status: 404 });
        return NextResponse.json(patient);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
