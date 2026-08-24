
import { NextResponse } from 'next/server';
import { medicalOrderService } from '@/lib/services/medicalOrderService';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.patientDocument || !body.doctorName) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const order = await medicalOrderService.createOrder(body);
        return NextResponse.json(order);
    } catch (error: any) {
        console.error('Error creating order:', error);
        return NextResponse.json({ message: 'Error creating order' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
        return NextResponse.json({ message: 'Patient ID required' }, { status: 400 });
    }

    const orders = await medicalOrderService.getOrdersByPatient(patientId);
    return NextResponse.json(orders);
}
