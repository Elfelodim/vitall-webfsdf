import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        // Expecting array of { code, name, type }

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid format' }, { status: 400 });
        }

        // Use upsert to update names if code exists, or create new
        // Note: Prisma createMany doesn't support upsert logic easily for many diverse records without conflicts.
        // For bulk massive imports, transaction of upserts is safer or delete+create (risky for balances).
        // Since we want to preserve balances, we'll try to find existing ones and only create new ones, or update names.
        
        let count = 0;
        await prisma.$transaction(async (tx) => {
            for (const item of body) {
                if (!item.code || !item.name) continue;

                // Simple upsert
                await tx.account.upsert({
                    where: { code: item.code },
                    update: { 
                        name: item.name, 
                        type: item.type // Update type and name if re-uploading
                    },
                    create: {
                        code: item.code,
                        name: item.name,
                        type: item.type || 'Otro',
                        balance: 0 // Initial balance 0
                    }
                });
                count++;
            }
        });

        return NextResponse.json({ success: true, count });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error processing bulk import' }, { status: 500 });
    }
}
