import { NextRequest, NextResponse } from 'next/server';
import { cupsService } from '@/lib/services/cupsService';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    try {
        if (query) {
            const results = await cupsService.search(query);
            return NextResponse.json(results);
        } else {
            const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
            const results = await cupsService.getAll(0, limit);
            return NextResponse.json(results);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching CUPS' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const result = await cupsService.create(body);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ error: 'Error creating CUPS' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await cupsService.deleteAll();
        return NextResponse.json({ message: 'All CUPS deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Error deleting CUPS' }, { status: 500 });
    }
}
