
import { NextResponse } from 'next/server';
import { admissionsService } from '@/lib/services/admissionsService';
import prisma from '@/lib/prisma'; // In case we need direct access later, but service is preferred

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validation
        if (!data.serviceOrderId || !data.cupsCode || !data.unitValue) {
            return NextResponse.json({ message: 'Faltan datos requeridos (Order ID, CUPS, Valor)' }, { status: 400 });
        }

        const item = await admissionsService.addServiceItem(data);
        return NextResponse.json(item);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
        return NextResponse.json({ message: 'Order ID required' }, { status: 400 });
    }

    try {
        const items = await admissionsService.getServiceItems(orderId);
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
