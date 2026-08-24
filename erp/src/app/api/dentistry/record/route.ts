import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            patientDocument,
            doctorName,
            reasonForVisit,
            odontogramData,
            treatmentPlan,
            observations
        } = body;

        if (!patientDocument) {
            return NextResponse.json(
                { message: 'Documento del paciente es requerido' },
                { status: 400 }
            );
        }

        const record = await prisma.dentalRecord.create({
            data: {
                patientDocument,
                doctorName: doctorName || 'Dr. General', // Should come from session
                reasonForVisit: reasonForVisit || '',
                odontogramData: JSON.stringify(odontogramData || {}),
                treatmentPlan: treatmentPlan || '',
                observations: observations || ''
            }
        });

        return NextResponse.json(record);

    } catch (error: any) {
        console.error('Error creating dental record:', error);
        return NextResponse.json(
            { message: 'Error al guardar la consulta odontológica' },
            { status: 500 }
        );
    }
}
