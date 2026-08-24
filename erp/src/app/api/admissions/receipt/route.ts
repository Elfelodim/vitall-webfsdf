import { NextResponse } from 'next/server';
import { admissionsService } from '@/lib/services/admissionsService';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body: { patientDocument, serviceOrderId, amount, paymentMethod, concept, prefix, notes }

        if (!body.patientDocument || !body.amount || !body.prefix) {
            return NextResponse.json({ message: 'Missing required receipt fields' }, { status: 400 });
        }

        const receipt = await admissionsService.createReceipt(body);
        return NextResponse.json(receipt);
    } catch (error: any) {
        console.error('Receipt Creation Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
