import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const product = await inventoryService.createProduct(data);
        return NextResponse.json(product, { status: 201 });
    } catch (error: any) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { message: error.message || 'Error creating product' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const products = await inventoryService.getProducts();
        return NextResponse.json(products);
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || 'Error retrieving products' },
            { status: 500 }
        );
    }
}
