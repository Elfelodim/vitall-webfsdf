
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // data should be an array of { name, nit, code, regime }
        if (!Array.isArray(data)) {
            return NextResponse.json({ message: 'Se espera un array de datos' }, { status: 400 });
        }

        // Use transaction to ensure validity
        const results = await prisma.$transaction(
            data.map((item: any) =>
                prisma.insurer.upsert({
                    where: { code: String(item.code) },
                    update: {
                        name: item.name,
                        nit: String(item.nit),
                        regime: item.regime
                    },
                    create: {
                        name: item.name,
                        nit: String(item.nit),
                        code: String(item.code),
                        regime: item.regime || 'Contributivo'
                    }
                })
            )
        );

        return NextResponse.json({ count: results.length });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
