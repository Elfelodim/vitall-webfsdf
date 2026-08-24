
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const history = await prisma.billSubmission.findMany({
            include: { insurer: true },
            orderBy: { submissionDate: 'desc' },
            take: 20
        });
        return NextResponse.json(history);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
