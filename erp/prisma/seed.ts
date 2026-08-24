import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Chart of Accounts (PUC Salud)
    const accounts = [
        { code: '1105', name: 'Caja General', type: 'Asset', balance: 5000000 },
        { code: '1110', name: 'Bancos', type: 'Asset', balance: 25000000 },
        { code: '1115', name: 'Inversiones', type: 'Asset', balance: 0 },
        { code: '1305', name: 'Clientes / Cuentas Médicas por Cobrar', type: 'Asset', balance: 12000000 },
        { code: '1435', name: 'Inventario de Medicamentos e Insumos', type: 'Asset', balance: 8500000 },
        { code: '2505', name: 'Salarios por Pagar', type: 'Liability', balance: 0 },
        { code: '3205', name: 'Ajuste / Superávit de Capital', type: 'Equity', balance: 0 },
        { code: '4105', name: 'Ingresos por Servicios de Salud', type: 'Revenue', balance: 0 },
        { code: '5105', name: 'Gastos de Personal / Sueldos Médicos', type: 'Expense', balance: 0 },
        { code: '6135', name: 'Costo de Ventas y Prestación de Servicios Salud', type: 'Expense', balance: 0 }
    ];

    for (const acc of accounts) {
        await prisma.account.upsert({
            where: { code: acc.code },
            update: { name: acc.name, type: acc.type },
            create: acc,
        });
    }
    console.log('PUC Accounts seeded.');

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
