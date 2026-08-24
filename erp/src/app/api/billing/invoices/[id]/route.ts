import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } // Awaiting params for Next 15+
) {
    try {
        const { id } = await params;
        const invoice = await prisma.invoice.findUnique({
            where: { invoiceNumber: id }, // We search by Invoice Number (e.g. SETT1)
            include: {
                patient: true,
                items: true
            }
        });

        if (!invoice) return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 });

        return NextResponse.json(invoice);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
