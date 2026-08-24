
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Fetch orders that are NOT marked as Billed and have NO linked invoices
        const orders = await prisma.serviceOrder.findMany({
            where: {
                status: { not: 'Billed' },
                invoices: { none: {} }
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        documentNumber: true
                    }
                }
            },
            orderBy: {
                admissionDate: 'desc'
            },
            take: 20 // Limit to recent 20 for suggestions
        });

        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
