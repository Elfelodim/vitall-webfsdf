
import { prisma } from '@/lib/prisma';

export const medicalOrderService = {
    // --- CUPS / Procedures ---
    async searchCups(query: string) {
        return await prisma.cUPS.findMany({
            where: {
                OR: [
                    { code: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            take: 20
        });
    },

    async getCupByCode(code: string) {
        return await prisma.cUPS.findUnique({
            where: { code }
        });
    },

    // --- Orders ---
    async createOrder(data: any) {
        return await prisma.medicalOrder.create({
            data: {
                patientDocument: data.patientDocument,
                clinicalRecordId: data.clinicalRecordId,
                recordType: data.recordType,
                doctorName: data.doctorName,
                medications: JSON.stringify(data.medications), // [{ productId, quantity, notes }]
                procedures: JSON.stringify(data.procedures),   // [{ code, name, quantity, notes }]
                incapacity: JSON.stringify(data.incapacity),   // { days, startDate, diagnosis, type }
                recommendations: data.recommendations,
                status: 'Pending'
            }
        });
    },

    async getOrdersByPatient(patientId: string) {
        return await prisma.medicalOrder.findMany({
            where: { patientDocument: patientId },
            orderBy: { date: 'desc' }
        });
    }
};
