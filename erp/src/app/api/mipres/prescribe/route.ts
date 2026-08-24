import { NextResponse } from 'next/server';
import { mipresService } from '@/lib/services/mipresService';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 1. Authenticate (Get Token)
        const token = await mipresService.authenticate();

        // 2. Send Prescription
        const result = await mipresService.createPrescription(data, token);

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('MIPRES API Handler Error:', error);
        return NextResponse.json(
            { message: error.message || 'Error al procesar MIPRES' },
            { status: 500 }
        );
    }
}
