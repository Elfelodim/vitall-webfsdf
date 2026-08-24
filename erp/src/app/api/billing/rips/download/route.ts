import { NextRequest, NextResponse } from 'next/server';
import { ripsService } from '@/lib/services/ripsService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('invoiceId');

    if (!invoiceId) {
        return NextResponse.json({ error: 'Invoice ID required' }, { status: 400 });
    }

    try {
        const ripsData = await ripsService.generateRipsJson(invoiceId);

        // Return as JSON file download
        const jsonString = JSON.stringify(ripsData, null, 2);

        return new NextResponse(jsonString, {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="RIPS_${ripsData.numFacturaVenta}.json"`
            }
        });
    } catch (error) {
        console.error('RIPS Gen Error:', error);
        return NextResponse.json({ error: 'Failed to generate RIPS' }, { status: 500 });
    }
}
