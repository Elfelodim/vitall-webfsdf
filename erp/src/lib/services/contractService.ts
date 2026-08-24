
import prisma from '@/lib/prisma';

export const contractService = {
    /**
     * Create a new Contract
     */
    async createContract(data: any) {
        return await prisma.contract.create({
            data
        });
    },

    /**
     * Get all active contracts
     */
    async getContracts() {
        return await prisma.contract.findMany({
            where: { status: 'Active' },
            orderBy: { clientName: 'asc' }
        });
    },

    /**
     * Add a specific rate (Own Rate or Exception)
     */
    async addRate(data: { contractId: string; cupsCode: string; value: number }) {
        return await prisma.contractRate.upsert({
            where: {
                contractId_cupsCode: {
                    contractId: data.contractId,
                    cupsCode: data.cupsCode
                }
            },
            update: { value: data.value },
            create: data
        });
    },

    /**
     * Calculate price for a CUPS code under a specific Contract
     */
    async calculatePrice(contractId: string, cupsCode: string): Promise<{ value: number; source: string }> {
        const contract = await prisma.contract.findUnique({
            where: { id: contractId }
        });

        if (!contract) throw new Error('Contrato no encontrado');

        // 1. Check Specific Rate (ContractRate)
        const specificRate = await prisma.contractRate.findUnique({
            where: {
                contractId_cupsCode: {
                    contractId,
                    cupsCode
                }
            }
        });

        if (specificRate) {
            return { value: specificRate.value, source: 'Tarifa Propia' };
        }

        // 2. Check Standard Manual (SOAT / ISS)
        if (contract.manualType === 'OWN') {
            return { value: 0, source: 'No Definido' }; // Needs specific rate
        }

        // Determine Manual Year (Logic to be expanded, for now assume 2024 or based on contract year logic?)
        // Usually contracts specify "SOAT 2024 + 10%". If year not in contract, assume current year manual?
        // For simplicity, let's look for the manual matching the contract's type.
        // Ideally, we need 'year' in contract or default to latest.
        const manualRate = await prisma.standardManual.findFirst({
            where: {
                code: cupsCode,
                manualType: contract.manualType
            },
            orderBy: { year: 'desc' } // Get latest available
        });

        if (manualRate) {
            let baseValue = manualRate.value;

            // ISS Logic often involves UVR/Points * Current Minimum Wage factor.
            // But if 'value' in StandardManual store the price directly (SOAT) or point value?
            // User requirement: SOAT, ISS 2000, 2001, 2004.
            // SOAT is usually Price. ISS is Points.
            // If ISS, we need a "Point Value".
            // Implementation Detail: We'll assume StandardManual 'value' is the PRICE for SOAT, 
            // and for ISS it is POINTS, needing a multiplier? 
            // The user didn't specify the Multiplier for ISS (SMLV).
            // For MVP, I will treat 'value' as the final base price to simplify, 
            // OR I should assume 1 point = 1 peso and adjustment handles it?
            // Let's assume 'value' is the base PRICE.

            // Apply Adjustment
            // adjustmentPercentage: 10 => +10% => * 1.10
            // adjustmentPercentage: -5 => -5% => * 0.95
            const factor = 1 + (contract.adjustmentPercentage / 100);
            const finalValue = baseValue * factor;

            return { value: Math.round(finalValue), source: `${contract.manualType} ${manualRate.year} (${contract.adjustmentPercentage}%)` };
        }

        return { value: 0, source: 'No Encontrado' };
    },

    /**
     * Update Budget Cap Execution
     */
    async updateExecutedBudget(contractId: string, amount: number) {
        return await prisma.contract.update({
            where: { id: contractId },
            data: {
                currentExecuted: { increment: amount }
            }
        });
    }
};
