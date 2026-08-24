import { prisma } from '@/lib/prisma';

export interface AppointmentInput {
    patientDocument: string;
    doctorId: string;
    doctorName: string;
    date: Date;
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
    type: string;
    status: string;
    notes?: string;
}

export const agendaService = {
    getAppointments: async (date: Date, doctorId?: string) => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return prisma.appointment.findMany({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                ...(doctorId ? { doctorId } : {}),
            },
            include: {
                patient: {
                    select: {
                        firstName: true,
                        lastName: true,
                        documentNumber: true
                    }
                }
            },
            orderBy: {
                startTime: 'asc'
            }
        });
    },

    createAppointment: async (data: AppointmentInput) => {
        // Simple conflict check: same doctor, same date, overlapping time
        const conflicts = await prisma.appointment.findMany({
            where: {
                doctorId: data.doctorId,
                date: data.date,
                startTime: { lt: data.endTime },
                endTime: { gt: data.startTime }
            }
        });

        if (conflicts.length > 0) {
            throw new Error('Conflicto de horario: El doctor ya tiene una cita en este intervalo.');
        }

        return prisma.appointment.create({
            data: {
                patientDocument: data.patientDocument,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                type: data.type,
                status: data.status,
                notes: data.notes
            }
        });
    },

    updateAppointment: async (id: string, data: Partial<AppointmentInput>) => {
        return prisma.appointment.update({
            where: { id },
            data
        });
    },

    cancelAppointment: async (id: string) => {
        return prisma.appointment.update({
            where: { id },
            data: { status: 'Cancelled' }
        });
    },

    deleteAppointment: async (id: string) => {
        return prisma.appointment.delete({
            where: { id }
        });
    }
};
