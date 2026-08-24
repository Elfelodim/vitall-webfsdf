import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const invoices = await prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            include: {
                patient: true
            },
            take: 50
        });
        return NextResponse.json(invoices);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
