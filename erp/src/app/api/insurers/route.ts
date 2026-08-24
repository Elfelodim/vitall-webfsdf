
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const insurers = await prisma.insurer.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(insurers);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { name, nit, code, regime } = data;

        if (!name || !nit || !code) {
            return NextResponse.json({ message: 'Datos incompletos' }, { status: 400 });
        }

        const insurer = await prisma.insurer.create({
            data: {
                name, nit, code, regime: regime || 'Contributivo'
            }
        });
        return NextResponse.json(insurer);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
