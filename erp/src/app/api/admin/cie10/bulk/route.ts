import { NextResponse } from 'next/server';
import { cie10Service } from '@/lib/services/cie10Service';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ message: 'Body must be an array' }, { status: 400 });
        }

        const count = await cie10Service.createBulk(body);
        return NextResponse.json({ count });
    } catch (error: any) {
        console.error('CIE10 Bulk Import Error:', error);
        // Extract useful message from Prisma error if possible
        const msg = error.message || 'Error processing bulk import';
        return NextResponse.json({
            message: msg,
            details: error
        }, { status: 500 });
    }
}
