
import { NextResponse } from 'next/server';
import { contractService } from '@/lib/services/contractService';

export async function GET() {
    try {
        const contracts = await contractService.getContracts();
        return NextResponse.json(contracts);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        // Basic validation
        if (!data.clientName || !data.manualType) {
            return NextResponse.json({ message: 'Nombre y Tipo de Manual requeridos' }, { status: 400 });
        }

        const contract = await contractService.createContract({
            ...data,
            validityStart: new Date(data.validityStart),
            validityEnd: new Date(data.validityEnd),
            budgetCap: data.budgetCap ? parseFloat(data.budgetCap) : null,
            adjustmentPercentage: parseFloat(data.adjustmentPercentage) || 0
        });

        return NextResponse.json(contract);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
