import { NextResponse } from 'next/server';
import { agendaService } from '@/lib/services/agendaService';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateStr = searchParams.get('date');
        const doctorId = searchParams.get('doctorId');

        if (!dateStr) {
            return NextResponse.json({ message: 'Fecha requerida' }, { status: 400 });
        }

        const date = new Date(dateStr);
        const appointments = await agendaService.getAppointments(date, doctorId || undefined);

        return NextResponse.json(appointments);
    } catch (error) {
        console.error('Error in Agenda GET API:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // date comes as string "YYYY-MM-DD"
        const data = {
            ...body,
            date: new Date(body.date)
        };

        const appointment = await agendaService.createAppointment(data);
        return NextResponse.json(appointment);
    } catch (error: any) {
        console.error('Error in Agenda POST API:', error);
        return NextResponse.json({ message: error.message || 'Error al crear la cita' }, { status: 400 });
    }
}
