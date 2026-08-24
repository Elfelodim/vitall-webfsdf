import { NextResponse } from 'next/server';
import { cie10Service } from '@/lib/services/cie10Service';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

        if (query) {
            const results = await cie10Service.search(query);
            return NextResponse.json(results);
        } else {
            const results = await cie10Service.getAll(0, limit);
            return NextResponse.json(results);
        }
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching CIE10', error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const newEntry = await cie10Service.create(body);
        return NextResponse.json(newEntry);
    } catch (error) {
        return NextResponse.json({ message: 'Error creating CIE10', error }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await cie10Service.deleteAll();
        return NextResponse.json({ message: 'All CIE10 deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Error deleting CIE10', error }, { status: 500 });
    }
}
