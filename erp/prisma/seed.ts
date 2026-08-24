import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Chart of Accounts (PUC)
    const accounts = [
        { code: '1105', name: 'Caja', type: 'Asset', balance: 5000000 },
        { code: '1110', name: 'Bancos', type: 'Asset', balance: 25000000 },
        { code: '1115', name: 'Inversiones', type: 'Asset', balance: 0 }
    ];

    for (const acc of accounts) {
        await prisma.account.upsert({
            where: { code: acc.code },
            update: {},
            create: acc,
        });
    }
    console.log('Accounts seeded.');

    // 2. Admin Users ClickSalud
    const defaultPassword = 'Admon123';
    const hashedPassword = await hash(defaultPassword, 10);

    const adminUsers = [
        { name: 'Administrador ClickSalud', email: 'admin@clicksalud.com', role: 'Admin' },
        { name: 'Alexander Franco', email: 'afjm1985@gmail.com', role: 'Admin' }
    ];

    for (const u of adminUsers) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {
                role: 'Admin',
                password: hashedPassword
            },
            create: {
                name: u.name,
                email: u.email,
                password: hashedPassword,
                role: 'Admin'
            }
        });
        console.log(`Admin user seeded: ${u.email} / ${defaultPassword}`);
    }

    console.log('Seed finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
