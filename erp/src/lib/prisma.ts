import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

function getDatabaseUrl() {
    let url = process.env.DATABASE_URL || "postgresql://postgres.zdmiylgzioarginxrmbd:YShWw%243b%2F%2FNSwJB@aws-0-us-east-1.pooler.supabase.com:5432/postgres";
    
    // Auto-fix if direct IPv6 URL is provided
    if (url.includes('db.zdmiylgzioarginxrmbd.supabase.co')) {
        url = url.replace('db.zdmiylgzioarginxrmbd.supabase.co:5432', 'aws-0-us-east-1.pooler.supabase.com:5432');
        url = url.replace('db.zdmiylgzioarginxrmbd.supabase.co', 'aws-0-us-east-1.pooler.supabase.com:5432');
        if (url.includes('://postgres:') && !url.includes('postgres.zdmiylgzioarginxrmbd')) {
            url = url.replace('://postgres:', '://postgres.zdmiylgzioarginxrmbd:');
        }
    }
    return url;
}

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        datasources: {
            db: {
                url: getDatabaseUrl(),
            },
        },
        log: ['error', 'warn'],
    });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
