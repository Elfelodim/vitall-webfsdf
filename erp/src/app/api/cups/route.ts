
import { NextResponse } from 'next/server';
import { medicalOrderService } from '@/lib/services/medicalOrderService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q) {
        return NextResponse.json([]);
    }

    const results = await medicalOrderService.searchCups(q);
    return NextResponse.json(results);
}
