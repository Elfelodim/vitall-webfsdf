import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const configs = await prisma.accountingConfig.findMany({
            orderBy: { key: 'asc' }
        });
        return NextResponse.json(configs);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { key, accountCode, label, module } = body;

        if (!key || !accountCode) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const config = await prisma.accountingConfig.upsert({
            where: { key },
            update: { accountCode, label, module },
            create: { key, accountCode, label, module }
        });

        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
