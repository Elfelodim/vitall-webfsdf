import { prisma } from '../prisma';

export const cie10Service = {
    search: async (query: string) => {
        return await prisma.cie10.findMany({
            where: {
                OR: [
                    { code: { contains: query } },
                    { description: { contains: query } }
                ]
            },
            take: 20
        });
    },

    create: async (data: { code: string; description: string }) => {
        return await prisma.cie10.create({ data });
    },

    createBulk: async (items: { code: string; description: string }[]) => {
        // Chunking strategy to avoid "Transaction not found" (timeout) or "Invalid invocation" errors.
        // We process in small batches of 50.
        const CHUNK_SIZE = 50;
        let totalCount = 0;

        for (let i = 0; i < items.length; i += CHUNK_SIZE) {
            const chunk = items.slice(i, i + CHUNK_SIZE);

            try {
                // Process each chunk in its own simplified independent transaction
                await prisma.$transaction(async (tx) => {
                    for (const item of chunk) {
                        if (!item.code || !item.description) continue;

                        // Use upsert to handle duplicates gracefully
                        await tx.cie10.upsert({
                            where: { code: item.code },
                            update: { description: item.description },
                            create: { code: item.code, description: item.description }
                        });
                    }
                }, {
                    maxWait: 5000,
                    timeout: 20000
                });

                totalCount += chunk.length;
                console.log(`Processed chunk ${i / CHUNK_SIZE + 1} (${chunk.length} items)`);
            } catch (err) {
                console.error(`Error processing chunk starting at index ${i}:`, err);
                // We decide to continue processing other chunks even if one fails,
                // or you could throw here to stop everything. 
                // For bulk imports, partial success is often better than 0.
            }
        }

        return totalCount;
    },

    getAll: async (skip = 0, take = 10000) => {
        return await prisma.cie10.findMany({
            skip,
            take,
            orderBy: { code: 'asc' }
        });
    },

    deleteAll: async () => {
        return await prisma.cie10.deleteMany({});
    }
};
