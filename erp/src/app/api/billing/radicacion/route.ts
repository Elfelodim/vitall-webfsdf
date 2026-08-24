
import { NextResponse } from 'next/server';
import { billingCycleService } from '@/lib/services/billingCycleService';
import prisma from '@/lib/prisma'; // Need to fetch insurer if not passed

export async function POST(request: Request) {
    try {
        const body = await request.json();
        let { invoiceIds, stickerNumber, insurerId } = body;

        // Auto-resolve insurerId if missing (take from first invoice's contract or patient eps? Complex without standardizing)
        // For now, let's try to look up the insurer from the first invoice's contract
        if (!insurerId && invoiceIds.length > 0) {
            const firstInv = await prisma.invoice.findUnique({
                where: { id: invoiceIds[0] },
                include: {
                    serviceOrder: {
                        include: {
                            contract: { include: { insurer: true } }
                        }
                    }
                }
            });

            if (firstInv?.serviceOrder?.contract?.insurerId) {
                insurerId = firstInv.serviceOrder.contract.insurerId;
            } else {
                // Fallback or Error. For MVP, allow null if schema allows, or use a "Default" insurer id? 
                // Schema requires insurerId in BillSubmission.
                // We will verify if we can find one, if not, return error.
                return NextResponse.json({ message: 'No se pudo determinar la Aseguradora (EPS) de las facturas seleccionadas. Asegúrate que la Orden tenga Contrato y Aseguradora.' }, { status: 400 });
            }
        }

        const submission = await billingCycleService.createSubmission({
            ...body,
            insurerId
        });

        return NextResponse.json(submission);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
