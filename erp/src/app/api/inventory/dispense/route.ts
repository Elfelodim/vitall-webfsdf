import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productId, quantity, patientDocument, clinicalRecordId, notes } = body;

        // Basic validation
        if (!productId || !quantity || !patientDocument) {
            return NextResponse.json(
                { message: 'Faltan datos requeridos (productId, quantity, patientDocument)' },
                { status: 400 }
            );
        }

        const result = await inventoryService.dispenseMedication({
            productId,
            quantity: Number(quantity),
            patientDocument,
            clinicalRecordId,
            notes
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Error dispensing medication:', error);
        return NextResponse.json(
            { message: error.message || 'Error al dispensar medicamento' },
            { status: 500 }
        );
    }
}
