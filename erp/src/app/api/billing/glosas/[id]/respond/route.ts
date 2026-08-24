
import { NextResponse } from 'next/server';
import { billingCycleService } from '@/lib/services/billingCycleService';

// Params likely needed (Next.js 13+ route handlers with params)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { action, acceptanceNote, refusalNote, acceptedValue } = body;

        if (!['Accept', 'Refute'].includes(action)) {
            return NextResponse.json({ message: 'Acción inválida' }, { status: 400 });
        }

        const result = await billingCycleService.respondGlosa(
            id,
            action as 'Accept' | 'Refute',
            acceptanceNote || '',
            refusalNote || '',
            parseFloat(acceptedValue) || 0
        );

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
