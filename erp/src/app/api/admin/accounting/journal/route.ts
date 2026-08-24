import { NextResponse } from 'next/server';
import { accountingService } from '@/lib/services/accountingService';

export async function GET() {
    try {
        const entries = await accountingService.getJournalEntries();
        return NextResponse.json(entries);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch journal entries' }, { status: 500 });
    }
}
