import { NextResponse } from 'next/server';
import { agendaService } from '@/lib/services/agendaService';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const appointment = await agendaService.updateAppointment(params.id, body);
        return NextResponse.json(appointment);
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error al actualizar la cita' }, { status: 400 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await agendaService.deleteAppointment(params.id);
        return NextResponse.json({ message: 'Cita eliminada correctamente' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || 'Error al eliminar la cita' }, { status: 400 });
    }
}
