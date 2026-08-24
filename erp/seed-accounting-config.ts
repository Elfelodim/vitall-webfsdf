import { prisma } from '@/lib/prisma';

const DEFAULT_CONFIGS = [
    { key: 'GLOBAL_ASSET_ACCOUNT', label: 'Caja General / Activo', module: 'Treasury', accountCode: '110505' },
    { key: 'GLOBAL_RECEIVABLE_ACCOUNT', label: 'Clientes (Ctas por Cobrar)', module: 'Billing', accountCode: '1305' },
    { key: 'GLOBAL_INCOME_ACCOUNT', label: 'Ingresos Operacionales', module: 'Billing', accountCode: '4105' },
    { key: 'GLOBAL_TAX_ACCOUNT', label: 'Impuesto Generado (IVA)', module: 'Billing', accountCode: '2408' },
    { key: 'INVENTORY_ASSET_ACCOUNT', label: 'Inventarios (Activo)', module: 'Inventory', accountCode: '1435' },
    { key: 'INVENTORY_COGS_ACCOUNT', label: 'Costo de Ventas', module: 'Inventory', accountCode: '6135' },
    { key: 'INVENTORY_ADJUSTMENT_ACCOUNT', label: 'Ajuste Inventario (Contrapartida)', module: 'Inventory', accountCode: '3205' },
    { key: 'PAYROLL_EXPENSE_ACCOUNT', label: 'Gastos de Personal', module: 'Payroll', accountCode: '5105' },
    { key: 'PAYROLL_LIABILITY_ACCOUNT', label: 'Salarios por Pagar', module: 'Payroll', accountCode: '2505' },
];

async function seed() {
    console.log('Seeding Accounting Config...');
    for (const conf of DEFAULT_CONFIGS) {
        await prisma.accountingConfig.upsert({
            where: { key: conf.key },
            update: { ...conf },
            create: { ...conf }
        });
    }
    console.log('Done.');
}

seed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
