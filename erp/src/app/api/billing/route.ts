import { NextResponse } from 'next/server';
import { billingService } from '@/lib/services/billingService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patientId = searchParams.get('patientId');

        if (patientId) {
            const invoices = await billingService.getInvoicesByPatientId(patientId);
            return NextResponse.json(invoices);
        }

        const invoices = await billingService.getInvoices();
        return NextResponse.json(invoices);
    } catch (error: any) {
        console.error('Error in Billing GET API:', error);
        return NextResponse.json(
            { message: error.message || 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
