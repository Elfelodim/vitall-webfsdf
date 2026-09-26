import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const SUPABASE_VERIFIED_URL = "postgresql://postgres.zdmiylgzioarginxrmbd:YShWw%243b%2F%2FNSwJB@aws-1-us-east-2.pooler.supabase.com:5432/postgres";

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('db.zdmiylgzioarginxrmbd.supabase.co')
                    ? process.env.DATABASE_URL
                    : SUPABASE_VERIFIED_URL,
            },
        },
        log: ['error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
