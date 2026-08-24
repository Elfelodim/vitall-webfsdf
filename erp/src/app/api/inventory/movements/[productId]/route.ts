import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params;
        const movements = await inventoryService.getProductMovements(productId);
        return NextResponse.json(movements);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
