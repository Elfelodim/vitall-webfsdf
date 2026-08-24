import { Product, Batch } from '@/types/inventory';
import { prisma } from '@/lib/prisma';
import { accountingService } from './accountingService';

// Mocks removed

export const inventoryService = {
    getProducts: async (): Promise<Product[]> => {
        const products = await prisma.product.findMany({
            include: { batches: true }
        });
        return products.map(p => ({
            id: p.id,
            code: p.code,
            name: p.name,
            type: p.type as any,
            category: p.category,
            unit: p.unit as any,
            minStock: p.minStock,
            currentStock: p.currentStock,
            price: p.price,
            status: p.status as any,
            batches: p.batches.map(b => ({
                id: b.id,
                batchNumber: b.batchNumber,
                expirationDate: b.expirationDate.toISOString().split('T')[0],
                quantity: b.quantity
            }))
        }));
    },

    getProductById: async (id: string): Promise<Product | undefined> => {
        const product = await prisma.product.findUnique({
            where: { id },
            include: { batches: true }
        });
        if (!product) return undefined;
        return {
            id: product.id,
            code: product.code,
            name: product.name,
            type: product.type as any,
            category: product.category,
            unit: product.unit as any,
            minStock: product.minStock,
            currentStock: product.currentStock,
            price: product.price,
            status: product.status as any,
            batches: product.batches.map(b => ({
                id: b.id,
                batchNumber: b.batchNumber,
                expirationDate: b.expirationDate.toISOString().split('T')[0],
                quantity: b.quantity
            }))
        };
    },

    createProduct: async (data: Omit<Product, 'id' | 'batches'> & { initialBatch?: Omit<Batch, 'id'> }): Promise<Product> => {
        const { initialBatch, ...productData } = data;

        return await prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
                data: {
                    code: productData.code,
                    name: productData.name,
                    type: productData.type,
                    category: productData.category,
                    unit: productData.unit,
                    price: productData.price,
                    currentStock: productData.currentStock,
                    minStock: productData.minStock,
                    status: productData.status,
                    batches: initialBatch ? {
                        create: {
                            batchNumber: initialBatch.batchNumber,
                            expirationDate: new Date(initialBatch.expirationDate),
                            quantity: initialBatch.quantity
                        }
                    } : undefined
                },
                include: { batches: true }
            });

            // Registrar movimiento inicial en Kardex
            if (productData.currentStock > 0) {
                const movement = await tx.inventoryMovement.create({
                    data: {
                        productId: product.id,
                        type: 'In',
                        quantity: productData.currentStock,
                        unitPrice: productData.price,
                        totalValue: productData.price * productData.currentStock,
                        reason: 'Inventario Inicial',
                        reference: 'REGISTRO-INICIAL'
                    }
                });
                await accountingService.recordInventoryEvent(movement, tx);
            }

            return {
                id: product.id,
                code: product.code,
                name: product.name,
                type: product.type as any,
                category: product.category,
                unit: product.unit as any,
                minStock: product.minStock,
                currentStock: product.currentStock,
                price: product.price,
                status: product.status as any,
                batches: product.batches.map(b => ({
                    id: b.id,
                    batchNumber: b.batchNumber,
                    expirationDate: b.expirationDate.toISOString().split('T')[0],
                    quantity: b.quantity
                }))
            };
        });
    },

    bulkCreateProducts: async (products: (Omit<Product, 'id' | 'batches'> & { initialBatch?: Omit<Batch, 'id'> })[]): Promise<Product[]> => {
        return await prisma.$transaction(async (tx) => {
            const resultProducts: Product[] = [];

            for (const data of products) {
                const { initialBatch, ...productData } = data;

                // Buscar si el producto ya existe por código
                const existingProduct = await tx.product.findUnique({
                    where: { code: productData.code },
                    include: { batches: true }
                });

                let product;

                if (existingProduct) {
                    // Si existe, incrementamos el stock
                    product = await tx.product.update({
                        where: { id: existingProduct.id },
                        data: {
                            currentStock: {
                                increment: productData.currentStock
                            }
                        },
                        include: { batches: true }
                    });

                    // Si trae un lote, lo agregamos al producto existente
                    if (initialBatch) {
                        await tx.batch.create({
                            data: {
                                productId: product.id,
                                batchNumber: initialBatch.batchNumber,
                                expirationDate: new Date(initialBatch.expirationDate),
                                quantity: initialBatch.quantity
                            }
                        });
                    }
                } else {
                    // Si no existe, lo creamos
                    product = await tx.product.create({
                        data: {
                            code: productData.code,
                            name: productData.name,
                            type: productData.type,
                            category: productData.category,
                            unit: productData.unit,
                            price: productData.price,
                            currentStock: productData.currentStock,
                            minStock: productData.minStock,
                            status: productData.status,
                            batches: initialBatch ? {
                                create: {
                                    batchNumber: initialBatch.batchNumber,
                                    expirationDate: new Date(initialBatch.expirationDate),
                                    quantity: initialBatch.quantity
                                }
                            } : undefined
                        },
                        include: { batches: true }
                    });
                }

                // Registrar el movimiento en Kardex
                if (productData.currentStock > 0) {
                    const movement = await tx.inventoryMovement.create({
                        data: {
                            productId: product.id,
                            type: 'In',
                            quantity: productData.currentStock,
                            unitPrice: productData.price,
                            totalValue: productData.price * productData.currentStock,
                            reason: existingProduct ? 'Carga Masiva - Incremento Stock' : 'Carga Masiva - Inventario Inicial',
                            reference: 'BULK-LOAD'
                        }
                    });
                    await accountingService.recordInventoryEvent(movement, tx);
                }

                resultProducts.push({
                    id: product.id,
                    code: product.code,
                    name: product.name,
                    type: product.type as any,
                    category: product.category,
                    unit: product.unit as any,
                    minStock: product.minStock,
                    currentStock: product.currentStock,
                    price: product.price,
                    status: product.status as any,
                    batches: product.batches.map(b => ({
                        id: b.id,
                        batchNumber: b.batchNumber,
                        expirationDate: b.expirationDate.toISOString().split('T')[0],
                        quantity: b.quantity
                    }))
                });
            }
            return resultProducts;
        });
    },

    getProductMovements: async (productId: string) => {
        return await prisma.inventoryMovement.findMany({
            where: { productId },
            orderBy: { date: 'desc' }
        });
    },

    registerMovement: async (data: {
        productId: string;
        type: 'In' | 'Out' | 'Adjustment';
        quantity: number;
        reason: string;
        reference?: string;
        unitPrice?: number;
    }) => {
        return await prisma.$transaction(async (tx) => {
            // Get current product for default price
            const productRef = await tx.product.findUnique({
                where: { id: data.productId }
            });

            if (!productRef) throw new Error('Producto no encontrado');

            const actualPrice = data.unitPrice || productRef.price;
            const totalValue = actualPrice * data.quantity;

            // 1. Create movement
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId: data.productId,
                    type: data.type,
                    quantity: data.quantity,
                    unitPrice: actualPrice,
                    totalValue: totalValue,
                    reason: data.reason,
                    reference: data.reference
                }
            });

            // 2. Update product stock
            // For 'Out', quantity should be subtracted even if passed as positive
            const stockChange = data.type === 'Out' ? -Math.abs(data.quantity) : data.quantity;

            const updatedProduct = await tx.product.update({
                where: { id: data.productId },
                data: {
                    currentStock: {
                        increment: stockChange
                    }
                }
            });

            await accountingService.recordInventoryEvent(movement, tx);

            return { movement, product: updatedProduct };
        });
    },

    getProductKardexSummary: async (productId: string) => {
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) return null;

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const lastYearMovements = await prisma.inventoryMovement.findMany({
            where: {
                productId,
                type: 'In',
                date: { gte: oneYearAgo }
            },
            orderBy: { date: 'desc' }
        });

        const lastMovement = await prisma.inventoryMovement.findFirst({
            where: { productId, type: 'In' },
            orderBy: { date: 'desc' }
        });

        // Simple average of prices for 'In' movements in last year
        const totalInPrices = lastYearMovements.reduce((acc, m) => acc + m.unitPrice, 0);
        const avgPriceLastYear = lastYearMovements.length > 0 ? totalInPrices / lastYearMovements.length : product.price;

        return {
            ...product,
            lastUnitValue: lastMovement?.unitPrice || product.price,
            avgValueLastYear: avgPriceLastYear
        };
    },

    /**
     * Dispense medication for a patient (Clinical Use).
     * deducts from batches (FIFO) and creates an 'Out' movement.
     */
    dispenseMedication: async (data: {
        productId: string;
        quantity: number;
        patientDocument: string; // Document number to link/log
        clinicalRecordId?: string;
        notes?: string;
    }) => {
        const { productId, quantity, patientDocument, clinicalRecordId, notes } = data;

        return await prisma.$transaction(async (tx) => {
            // 1. Get Product and current Stock
            const product = await tx.product.findUnique({
                where: { id: productId },
                include: { batches: true }
            });

            if (!product) throw new Error('Producto no encontrado');
            if (product.currentStock < quantity) {
                throw new Error(`Stock insuficiente. Disponible: ${product.currentStock}`);
            }

            // 2. FIFO Logic - Deduct from batches
            const batches = await tx.batch.findMany({
                where: {
                    productId,
                    quantity: { gt: 0 }
                },
                orderBy: { expirationDate: 'asc' } // Oldest first
            });

            let remainingToDeduct = quantity;

            for (const batch of batches) {
                if (remainingToDeduct <= 0) break;

                const deductAmount = Math.min(batch.quantity, remainingToDeduct);

                await tx.batch.update({
                    where: { id: batch.id },
                    data: { quantity: { decrement: deductAmount } }
                });

                remainingToDeduct -= deductAmount;
            }

            // 3. Update Product Total Stock
            const updatedProduct = await tx.product.update({
                where: { id: productId },
                data: { currentStock: { decrement: quantity } }
            });

            // 4. Create Movement Log (Kardex)
            const movement = await tx.inventoryMovement.create({
                data: {
                    productId,
                    type: 'Out',
                    quantity,
                    reason: `Suministro a Paciente. Referencia: ${clinicalRecordId || 'N/A'}. ${notes || ''}`.substring(0, 190), // Append notes to reason, truncated safely
                    reference: patientDocument,
                    unitPrice: product.price,
                    totalValue: product.price * quantity,
                }
            });

            await accountingService.recordInventoryEvent(movement, tx);

            return { success: true, newStock: updatedProduct.currentStock, movement };
        });
    }
};
