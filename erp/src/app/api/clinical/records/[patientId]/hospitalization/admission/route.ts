
import { NextResponse } from 'next/server';
import { medicalRecordService } from '@/lib/services/medicalRecordService';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ patientId: string }> }
) {
    try {
        const { patientId: patientDocument } = await params;

        // Validate patient exists
        const patient = await prisma.patient.findUnique({ where: { documentNumber: patientDocument } });
        if (!patient) {
            return NextResponse.json({ message: 'Paciente no encontrado' }, { status: 404 });
        }

        const data = await request.json();
        const record = await medicalRecordService.saveAdmission({ ...data, patientDocument });
        return NextResponse.json(record);
    } catch (error: any) {
        console.error('Error registering admission:', error);
        return NextResponse.json({
            message: error.message || 'Error desconocido en el servidor',
            details: error
        }, { status: 500 });
    }
}
