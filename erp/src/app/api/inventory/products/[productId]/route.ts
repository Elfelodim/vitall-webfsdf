import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function GET(req: Request, { params }: { params: Promise<{ productId: string }> }) {
    try {
        const { productId } = await params;
        const summary = await inventoryService.getProductKardexSummary(productId);
        if (!summary) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
        return NextResponse.json(summary);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
