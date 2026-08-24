import { NextResponse } from 'next/server';
import { patientService } from '@/lib/services/patientService';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const patients = await patientService.getPatients();
        return NextResponse.json(patients);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // We use upsert logic based on document number to support "Save" button behavior
        const patient = await prisma.patient.upsert({
            where: { documentNumber: data.documentNumber },
            update: { ...data },
            create: { ...data }
        });

        return NextResponse.json(patient);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
