
import { NextResponse } from 'next/server';
import { billingCycleService } from '@/lib/services/billingCycleService';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { invoiceIds } = body;

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            return NextResponse.json({ message: 'Seleccione al menos una factura' }, { status: 400 });
        }

        const rips = await billingCycleService.generateRipsJson(undefined, invoiceIds);

        const jsonString = JSON.stringify(rips, null, 2);

        // Find filename based on first invoice or timestamp
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `RIPS-${timestamp}.json`;

        return new NextResponse(jsonString, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
