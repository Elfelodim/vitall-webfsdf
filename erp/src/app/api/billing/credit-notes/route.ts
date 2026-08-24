
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { billingCycleService } from '@/lib/services/billingCycleService';

export async function GET() {
    try {
        const notes = await prisma.creditNote.findMany({
            include: { invoice: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(notes);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { invoiceNumber, value, reason } = body;

        // Find invoice
        const invoice = await prisma.invoice.findFirst({ where: { invoiceNumber } });
        if (!invoice) return NextResponse.json({ message: 'Factura no encontrada' }, { status: 404 });

        // Create Note (Logic usually resides in service, keeping generic here for speed)
        const note = await prisma.creditNote.create({
            data: {
                invoiceId: invoice.id,
                number: `NC-${Math.floor(Math.random() * 10000)}`, // Mock Numbering
                value,
                reason,
                dianStatus: 'Draft'
            }
        });

        // Update Invoice Balance
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: { currentBalance: { decrement: value } }
        });

        return NextResponse.json(note);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
