
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ consecutive: string }> } // Await params in Next.js 15
) {
    try {
        const { consecutive } = await params;
        const order = await prisma.serviceOrder.findUnique({
            where: { consecutive },
            include: {
                patient: true,
                items: true
            }
        });

        if (!order) {
            return NextResponse.json({ message: 'Orden no encontrada' }, { status: 404 });
        }

        return NextResponse.json(order);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
