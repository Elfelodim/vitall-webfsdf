import { NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services/inventoryService';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const result = await inventoryService.registerMovement(data);
        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
