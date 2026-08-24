
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { billingCycleService } from '@/lib/services/billingCycleService';

export async function GET(req: Request) {
    try {
        const glosas = await prisma.glosa.findMany({
            include: {
                invoice: {
                    include: {
                        patient: true,
                        serviceOrder: { include: { contract: { include: { insurer: true } } } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(glosas);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Validation handled in service or here
        if (!body.invoiceId || !body.value) {
            return NextResponse.json({ message: 'Faltan datos' }, { status: 400 });
        }

        const glosa = await billingCycleService.registerGlosa({
            invoiceId: body.invoiceId,
            code: body.code,
            description: body.description,
            value: parseFloat(body.value)
        });

        return NextResponse.json(glosa);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
