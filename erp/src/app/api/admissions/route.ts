import { NextResponse } from 'next/server';
import { admissionsService } from '@/lib/services/admissionsService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20;

        const orders = await admissionsService.getServiceOrders(limit);
        return NextResponse.json(orders);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body expected structure: { patient: {...}, order: {...} }

        if (!body.patient || !body.order) {
            return NextResponse.json({ message: 'Missing patient or order data' }, { status: 400 });
        }

        const result = await admissionsService.createAdmission(body.patient, body.order);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Admission Creation Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
