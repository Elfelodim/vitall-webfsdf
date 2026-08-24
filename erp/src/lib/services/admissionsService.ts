import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const admissionsService = {
    /**
     * Create or Update a Patient and then create a Service Order (Admission)
     */
    async createAdmission(
        patientData: {
            documentType: string;
            documentNumber: string;
            firstName: string;
            secondName?: string;
            lastName: string;
            secondLastName?: string;
            dateOfBirth: string; // YYYY-MM-DD
            sex: string;
            address: string;
            phone: string;
            email?: string;
            eps: string;
            regime: string;
            userType?: string;
            zone?: string;
        },
        orderData: {
            prefix: string;
            contractType?: string;
            program?: string;
        }
    ) {
        return await prisma.$transaction(async (tx) => {
            // 1. Upsert Patient
            // We look for existing patient by document number
            const patient = await tx.patient.upsert({
                where: { documentNumber: patientData.documentNumber },
                update: {
                    firstName: patientData.firstName,
                    secondName: patientData.secondName,
                    lastName: patientData.lastName,
                    secondLastName: patientData.secondLastName,
                    address: patientData.address,
                    phone: patientData.phone,
                    email: patientData.email,
                    eps: patientData.eps,
                    regime: patientData.regime,
                    userType: patientData.userType,
                    zone: patientData.zone,
                    // Don't update sex or DoB unless necessary? usually safer to update everything to latest info
                    dateOfBirth: patientData.dateOfBirth,
                    sex: patientData.sex,
                },
                create: {
                    ...patientData
                }
            });

            // 2. Calculate Next Consecutive Number for Service Order
            // Logic: Get max number for this prefix (or global? User said "consecutive... regardless of prefix" might imply global)
            // If "consecutivo alfanumérico" and "key is consecutive number", usually implies separate sequence per prefix is standard ERP behavior.
            // However, if the user requested "without import the prefix", maybe they mean the number is unique globally?
            // Let's implement PER PREFIX for safety as it creates cleaner sequences (A-1, A-2), but user said "KEY is consecutive".
            // Let's try to interpret: "Llave principal el numero de consecutivo" -> The number itself is the ID?
            // "Sin importar el prefijo en letras" -> Maybe prefix is just display.

            // Let's stick to SAFE implementation: Prefix + Number.
            // We find the last order with this prefix.
            const lastOrder = await tx.serviceOrder.findFirst({
                where: { prefix: orderData.prefix },
                orderBy: { number: 'desc' }
            });

            const nextNumber = (lastOrder?.number || 0) + 1;
            const consecutive = `${orderData.prefix}${nextNumber.toString().padStart(6, '0')}`;

            // 3. Create Service Order
            const serviceOrder = await tx.serviceOrder.create({
                data: {
                    consecutive,
                    prefix: orderData.prefix,
                    number: nextNumber,
                    patientDocument: patient.documentNumber,
                    contractType: orderData.contractType,
                    program: orderData.program,
                    status: 'Open',
                }
            });

            return { serviceOrder, patient };
        });
    },

    /**
     * Create a Cash Receipt (Recibo de Caja)
     */
    async createReceipt(data: {
        patientDocument: string;
        serviceOrderId?: string;
        amount: number;
        paymentMethod: string;
        concept: string;
        prefix: string; // Receipt prefix
        notes?: string;
    }) {
        return await prisma.$transaction(async (tx) => {
            // Get next receipt number
            const lastReceipt = await tx.paymentReceipt.findFirst({
                where: { prefix: data.prefix }, // Assuming prefix matters for receipts too
                orderBy: { number: 'desc' }
            });

            // note: if receipt prefix is null, this works too
            const nextNumber = (lastReceipt?.number || 0) + 1;
            const receiptNumber = `${data.prefix || 'RC'}-${nextNumber.toString().padStart(6, '0')}`;

            const receipt = await tx.paymentReceipt.create({
                data: {
                    receiptNumber,
                    prefix: data.prefix,
                    number: nextNumber,
                    patientDocument: data.patientDocument,
                    serviceOrderId: data.serviceOrderId,
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    concept: data.concept,
                    notes: data.notes
                }
            });

            return receipt;
        });
    },

    async getServiceOrders(limit = 20) {
        return await prisma.serviceOrder.findMany({
            take: limit,
            orderBy: { admissionDate: 'desc' },
            include: {
                patient: true,
                payments: true
            }
        });
    },

    async getServiceOrderById(id: string) {
        return await prisma.serviceOrder.findUnique({
            where: { id },
            include: {
                patient: true,
                payments: true,
                items: true
            }
        });
    },

    async getReceiptsByPatient(documentNumber: string) {
        return await prisma.paymentReceipt.findMany({
            where: { patientDocument: documentNumber },
            orderBy: { date: 'desc' },
            include: {
                serviceOrder: true
            }
        });
    },

    /**
     * Add an Item (CUPS) to the Service Order
     */
    async addServiceItem(data: {
        serviceOrderId: string;
        cupsCode: string;
        cupsDescription: string;
        quantity: number;
        unitValue: number;
    }) {
        const totalValue = data.quantity * data.unitValue;
        return await prisma.serviceOrderItem.create({
            data: {
                serviceOrderId: data.serviceOrderId,
                cupsCode: data.cupsCode,
                cupsDescription: data.cupsDescription,
                quantity: data.quantity,
                unitValue: data.unitValue,
                totalValue
            }
        });
    },

    /**
     * Get Service Order Items
     */
    async getServiceItems(serviceOrderId: string) {
        return await prisma.serviceOrderItem.findMany({
            where: { serviceOrderId }
        });
    },

    async getDailyStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Total Daily Receipts Amount
        const receipts = await prisma.paymentReceipt.aggregate({
            _sum: { amount: true },
            where: {
                date: { gte: today }
            }
        });

        // 2. Open Orders Count
        const openOrders = await prisma.serviceOrder.count({
            where: { status: 'Open' }
        });

        return {
            todayReceipts: receipts._sum.amount || 0,
            openOrdersCount: openOrders
        };
    }
};
