import { prisma } from '@/lib/prisma';

export const cupsService = {
    search: async (query: string) => {
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

    create: async (data: { code: string; description: string; category?: string }) => {
        return await prisma.cUPS.create({
            data
        });
    },

    createBulk: async (items: { code: string; description: string; category?: string }[]) => {
        // Use transaction to ensure all or nothing, or just createMany
        // Prisma SQLite doesn't support createMany with skipDuplicates nicely in older versions, 
        // but let's try strict createMany or loop for safety if we want to update.
        // For simplicity and speed in bulk:

        // We will process them one by one to handle update/skip logic if needed, 
        // but for pure import, transaction is better.

        return await prisma.$transaction(
            items.map(item =>
                prisma.cUPS.upsert({
                    where: { code: item.code },
                    update: { description: item.description, category: item.category },
                    create: { code: item.code, description: item.description, category: item.category }
                })
            )
        );
    },

    getAll: async (skip = 0, take = 10000) => { // Increased default, flexible
        return await prisma.cUPS.findMany({
            skip,
            take,
            orderBy: { code: 'asc' }
        });
    },

    deleteAll: async () => {
        return await prisma.cUPS.deleteMany({});
    }
};
