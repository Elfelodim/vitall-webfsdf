import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function POST(req: Request) {
    try {
        const products = await req.json();

        if (!Array.isArray(products)) {
            return NextResponse.json({ message: 'Input must be an array of products' }, { status: 400 });
        }

        const created = await inventoryService.bulkCreateProducts(products);
        return NextResponse.json(created, { status: 201 });
    } catch (error: any) {
        console.error('Error in bulk import:', error);
        return NextResponse.json(
            { message: error.message || 'Error executing bulk import' },
            { status: 500 }
        );
    }
}
