import { NextRequest, NextResponse } from 'next/server';
import { cupsService } from '@/lib/services/cupsService';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json(); // Expects array of { code, description, category }

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Expected an array of items' }, { status: 400 });
        }

        const result = await cupsService.createBulk(body);
        return NextResponse.json({ count: result.length, message: 'Bulk import successful' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error processing bulk import' }, { status: 500 });
    }
}
