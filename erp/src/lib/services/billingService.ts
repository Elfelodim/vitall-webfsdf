import { prisma } from '@/lib/prisma';
import { accountingService } from './accountingService';

export const billingService = {
    // --- Resolution Management ---

    createResolution: async (data: {
        resolutionNumber: string;
        prefix: string;
        fromNumber: number;
        toNumber: number;
        startDate: Date;
        endDate: Date;
        technicalKey: string;
    }) => {
        // Deactivate other active resolutions for same prefix to avoid conflicts (optional rule)
        // For now, just create
        return await prisma.billingResolution.create({
            data: {
                ...data,
                currentNumber: data.fromNumber,
                status: 'Active'
            }
        });
    },

    getActiveResolution: async () => {
        return await prisma.billingResolution.findFirst({
            where: { status: 'Active' },
            orderBy: { createdAt: 'desc' }
        });
    },

    getAllResolutions: async () => {
        return await prisma.billingResolution.findMany({
            orderBy: { createdAt: 'desc' }
        });
    },

    // --- Invoice Generation Helpers ---

    getNextInvoiceNumber: async () => {
        const resolution = await prisma.billingResolution.findFirst({
            where: { status: 'Active' },
            orderBy: { createdAt: 'desc' }
        });

        if (!resolution) {
            throw new Error('No hay resolución de facturación activa.');
        }

        if (resolution.currentNumber > resolution.toNumber) {
            throw new Error(`Resolución agotada. Último: ${resolution.toNumber}, Actual: ${resolution.currentNumber}`);
        }

        const nextNum = `${resolution.prefix}${resolution.currentNumber}`;
        return { fullNumber: nextNum, resolutionId: resolution.id, currentVal: resolution.currentNumber };
    },

    incrementResolutionCounter: async (resolutionId: string) => {
        await prisma.billingResolution.update({
            where: { id: resolutionId },
            data: { currentNumber: { increment: 1 } }
        });
    },

    getInvoices: async () => {
        return await prisma.invoice.findMany({
            orderBy: { date: 'desc' },
            include: { patient: true }
        });
    },

    createInvoice: async (data: {
        patientDocument: string;
        items: { code: string; description: string; quantity: number; unitPrice: number }[];
        paymentMethod: string;
        notes?: string;
    }) => {
        // 1. Get Resolution
        const resolution = await prisma.billingResolution.findFirst({
            where: { status: 'Active' },
            orderBy: { createdAt: 'desc' }
        });

        if (!resolution || resolution.currentNumber > resolution.toNumber) {
            throw new Error('Resolución agotada o inexistente.');
        }

        const invoiceNumber = `${resolution.prefix}${resolution.currentNumber}`;

        // 2. Calculate Totals
        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const tax = subtotal * 0; // 0% tax for now, configurable later
        const total = subtotal + tax;

        // 3. Generate Mock CUFE (SHA-384 simulation)
        // In real DIAN validation, this is a specific string concat + hashing
        const cufeString = `${invoiceNumber}${data.patientDocument}${total}${new Date().toISOString()}${resolution.technicalKey}`;
        // Mocking a hash for display purposes
        const crypto = require('crypto');
        const cufe = crypto.createHash('sha384').update(cufeString).digest('hex');

        // 4. Transaction
        return await prisma.$transaction(async (tx) => {
            // Create Invoice
            const invoice = await tx.invoice.create({
                data: {
                    patientDocument: data.patientDocument,
                    invoiceNumber: invoiceNumber,
                    dueDate: new Date(), // Immediate due date for POS/Standard
                    subtotal,
                    tax,
                    total,
                    status: 'Issued',
                    dianStatus: 'Signed', // Simulating successful internal signing
                    paymentMethod: data.paymentMethod,
                    cufe,
                    resolutionNumber: resolution.resolutionNumber,
                    prefix: resolution.prefix,
                    items: {
                        create: data.items.map(item => ({
                            code: item.code,
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            total: item.quantity * item.unitPrice
                        }))
                    }
                }
            });

            // Update Resolution
            await tx.billingResolution.update({
                where: { id: resolution.id },
                data: { currentNumber: { increment: 1 } }
            });

            // --- ACCOUNTING INTEGRATION ---
            await accountingService.recordInvoiceEvent(invoice, tx);
            // -----------------------------

            return invoice;
        });
    }
};
