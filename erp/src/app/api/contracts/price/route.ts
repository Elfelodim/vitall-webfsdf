
import { NextResponse } from 'next/server';
import { contractService } from '@/lib/services/contractService';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');
    const cups = searchParams.get('cups');

    if (!contractId || !cups) {
        return NextResponse.json({ message: 'Contract ID and CUPS required' }, { status: 400 });
    }

    try {
        const priceInfo = await contractService.calculatePrice(contractId, cups);
        return NextResponse.json(priceInfo);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
