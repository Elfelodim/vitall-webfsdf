import { NextResponse } from 'next/server';
import { billingService } from '@/lib/services/billingService';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Basic validation
        if (!data.patientDocument || !data.items || data.items.length === 0) {
            return NextResponse.json({ message: 'Faltan datos requeridos (paciente o items)' }, { status: 400 });
        }

        const invoice = await billingService.createInvoice(data);
        return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
        console.error('Invoice Error:', error);
        return NextResponse.json({ message: error.message || 'Error al crear factura' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const submission = searchParams.get('submission');

    const where: any = {};
    if (status) where.status = status;
    if (submission === 'null') where.submissionId = null;
    else if (submission) where.submissionId = submission;

    try {
        const invoices = await prisma.invoice.findMany({
            where,
            include: {
                patient: true,
                serviceOrder: { include: { contract: { include: { insurer: true } } } } // To get EPS/Insurer info
            },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(invoices);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
