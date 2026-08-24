import { Patient } from '@/types/patient';
import { prisma } from '@/lib/prisma';

// Mocks removed

export const patientService = {
    getPatients: async (): Promise<Patient[]> => {
        const patients = await prisma.patient.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return patients.map(p => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            // Ensure any other fields match or assert type if strictly compatible
        })) as Patient[];
    },

    getPatientById: async (id: string): Promise<Patient | undefined> => {
        const patient = await prisma.patient.findUnique({
            where: { id }
        });
        if (!patient) return undefined;
        return {
            ...patient,
            createdAt: patient.createdAt.toISOString()
        } as Patient;
    },

    getPatientByDocument: async (documentNumber: string): Promise<Patient | undefined> => {
        const patient = await prisma.patient.findUnique({
            where: { documentNumber }
        });
        if (!patient) return undefined;
        return {
            ...patient,
            createdAt: patient.createdAt.toISOString()
        } as Patient;
    },

    createPatient: async (patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> => {
        const newPatient = await prisma.patient.create({
            data: {
                ...patient,
                // Prisma handles id and createdAt default
            } as any
        });
        return {
            ...newPatient,
            createdAt: newPatient.createdAt.toISOString()
        } as Patient;
    },

    updatePatient: async (id: string, patient: Partial<Patient>): Promise<Patient> => {
        const updatedPatient = await prisma.patient.update({
            where: { id },
            data: {
                ...patient,
                updatedAt: new Date()
            } as any
        });
        return {
            ...updatedPatient,
            createdAt: updatedPatient.createdAt.toISOString()
        } as Patient;
    }
};
