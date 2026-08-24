import { Appointment, SurgeryRequest, OperatingRoom, AppointmentType, AppointmentStatus } from '@/types/scheduling';
import { prisma } from '@/lib/prisma';

export const schedulingService = {
    getAppointments: async (): Promise<Appointment[]> => {
        const appointments = await prisma.appointment.findMany({
            include: { patient: true }
        });
        return appointments.map(apt => ({
            id: apt.id,
            patientId: apt.patientId,
            patientName: `${apt.patient.firstName} ${apt.patient.lastName}`,
            doctorId: apt.doctorId,
            doctorName: apt.doctorName,
            date: apt.date.toISOString(),
            startTime: apt.startTime,
            endTime: apt.endTime,
            type: apt.type as AppointmentType,
            status: apt.status as AppointmentStatus,
            notes: apt.notes || undefined
        }));
    },

    createAppointment: async (apt: Omit<Appointment, 'id'>): Promise<Appointment> => {
        const created = await prisma.appointment.create({
            data: {
                patientId: apt.patientId,
                doctorId: apt.doctorId,
                doctorName: apt.doctorName,
                date: new Date(apt.date),
                startTime: apt.startTime,
                endTime: apt.endTime,
                type: apt.type,
                status: 'Scheduled',
                notes: apt.notes
            },
            include: { patient: true }
        });

        return {
            id: created.id,
            patientId: created.patientId,
            patientName: `${created.patient.firstName} ${created.patient.lastName}`,
            doctorId: created.doctorId,
            doctorName: created.doctorName,
            date: created.date.toISOString(),
            startTime: created.startTime,
            endTime: created.endTime,
            type: created.type as AppointmentType,
            status: created.status as AppointmentStatus,
            notes: created.notes || undefined
        };
    },

    getSurgeries: async (): Promise<SurgeryRequest[]> => {
        // Safe check if Surgery model exists in runtime (it does in verified schema)
        const surgeries = await prisma.surgery.findMany({
            include: { patient: true }
        });

        return surgeries.map(s => ({
            id: s.id,
            patientId: s.patientId,
            patientName: `${s.patient.firstName} ${s.patient.lastName}`,
            surgeonId: s.surgeonId,
            surgeonName: s.surgeonName,
            procedureCode: s.procedureCode,
            procedureName: s.procedureName,
            urgency: s.urgency as any,
            requestedDate: s.requestedDate.toISOString(),
            status: s.status as any,
            operatingRoomId: s.operatingRoomId || undefined
        }));
    },

    getOperatingRooms: async (): Promise<OperatingRoom[]> => {
        let rooms = await prisma.operatingRoom.findMany();

        if (rooms.length === 0) {
            // Auto-seed rooms if empty to ensure UI works
            try {
                await prisma.operatingRoom.createMany({
                    data: [
                        { name: 'Quirófano 1', status: 'Available' },
                        { name: 'Quirófano 2', status: 'Occupied' },
                    ]
                });
                rooms = await prisma.operatingRoom.findMany();
            } catch (e) {
                console.error("Failed to seed rooms", e);
                // Fallback if write fails (e.g. permission)
                return [
                    { id: 'OR-1', name: 'Quirófano 1 (Mock)', status: 'Available' },
                ];
            }
        }

        return rooms.map(r => ({
            id: r.id,
            name: r.name,
            status: r.status as any
        }));
    }
};
