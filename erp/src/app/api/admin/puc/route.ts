import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';

    try {
        const accounts = await prisma.account.findMany({
            where: {
                OR: [
                    { code: { contains: q } }, // Removed mode: 'insensitive' to rely on default collation if needed, but usually works. Or keep it simple.
                    { name: { contains: q } }
                ]
            },
            take: 50,
            orderBy: { code: 'asc' }
        });
        return NextResponse.json(accounts);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error fetching accounts' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    try {
        await prisma.account.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error deleting account' }, { status: 500 });
    }
}
