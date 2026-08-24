import { NextResponse } from 'next/server';
import { billingService } from '@/lib/services/billingService';

export async function GET() {
    try {
        const resolutions = await billingService.getAllResolutions();
        return NextResponse.json(resolutions);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const resolution = await billingService.createResolution({
            resolutionNumber: data.resolutionNumber,
            prefix: data.prefix,
            fromNumber: parseInt(data.fromNumber),
            toNumber: parseInt(data.toNumber),
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            technicalKey: data.technicalKey
        });
        return NextResponse.json(resolution, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
