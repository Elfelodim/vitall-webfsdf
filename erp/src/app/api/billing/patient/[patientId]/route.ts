import { NextResponse } from 'next/server';
import { billingService } from '@/lib/services/billingService';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ patientId: string }> }
) {
    try {
        const { patientId } = await params;

        if (!patientId) {
            return NextResponse.json(
                { message: 'ID de paciente requerido' },
                { status: 400 }
            );
        }

        const invoices = await billingService.getInvoicesByPatientId(patientId);
        return NextResponse.json(invoices);
    } catch (error: any) {
        console.error('Error fetching patient invoices:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor', error: error.message },
            { status: 500 }
        );
    }
}
