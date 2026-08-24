import { Account, Payroll, Employee } from '@/types/accounting';
import { prisma } from '@/lib/prisma';

// Employees mocked as HR source
const MOCK_EMPLOYEES: Employee[] = [
    { id: 'E1', name: 'Dr. Admin', document: '10001', salary: 8000000, position: 'Médico General', startDate: '2024-01-01' },
    { id: 'E2', name: 'Enf. Jefe', document: '10002', salary: 3500000, position: 'Enfermera', startDate: '2024-02-01' }
];

// --- Journal Entry Management ---

export const accountingService = {

    createJournalEntry: async (data: {
        date?: Date;
        description: string;
        referenceId?: string;
        referenceType?: string;
        lines: { accountCode: string; debit: number; credit: number; notes?: string }[];
    }, tx?: any) => {
        const client = tx || prisma;

        // Validation: Debits must equal Credits
        const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0);
        const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0);

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`Accounting Imbalance: Debit (${totalDebit}) != Credit (${totalCredit})`);
        }

        return await client.journalEntry.create({
            data: {
                date: data.date || new Date(),
                description: data.description,
                referenceId: data.referenceId,
                referenceType: data.referenceType,
                lines: {
                    create: data.lines.map(line => ({
                        accountCode: line.accountCode,
                        debit: line.debit,
                        credit: line.credit,
                        notes: line.notes
                    }))
                }
            }
        });
    },

    // --- Configuration Helper ---
    getConfig: async (key: string): Promise<string | null> => {
        const config = await prisma.accountingConfig.findUnique({
            where: { key }
        });
        return config?.accountCode || null;
    },

    // --- Event Hooks ---

    recordInvoiceEvent: async (invoice: any, tx: any) => {
        // IDs from AccountingConfig or Fallback
        const INCOME_ACCOUNT = await accountingService.getConfig('GLOBAL_INCOME_ACCOUNT') || '4105';
        const RECEIVABLE_ACCOUNT = await accountingService.getConfig('GLOBAL_RECEIVABLE_ACCOUNT') || '1305';
        const TAX_ACCOUNT = await accountingService.getConfig('GLOBAL_TAX_ACCOUNT') || '2408';

        const lines = [];

        // Debit: Client owes money (Asset)
        lines.push({
            accountCode: RECEIVABLE_ACCOUNT,
            debit: invoice.total,
            credit: 0,
            notes: `Factura de Venta ${invoice.invoiceNumber}`
        });

        // Credit: Revenue (Ingreso)
        lines.push({
            accountCode: INCOME_ACCOUNT,
            debit: 0,
            credit: invoice.subtotal,
            notes: 'Ingresos por Servicios de Salud'
        });

        // Credit: Tax (Pasivo)
        if (invoice.tax > 0) {
            lines.push({
                accountCode: TAX_ACCOUNT,
                debit: 0,
                credit: invoice.tax,
                notes: 'IVA Generado'
            });
        }

        await accountingService.createJournalEntry({
            date: invoice.date,
            description: `Venta Factura ${invoice.invoiceNumber}`,
            referenceId: invoice.id,
            referenceType: 'Invoice',
            lines
        }, tx);
    },

    recordInventoryEvent: async (movement: any, tx: any) => {
        // Accounts from Config
        const INVENTORY_ACCOUNT = await accountingService.getConfig('INVENTORY_ASSET_ACCOUNT') || '1435';
        const COGS_ACCOUNT = await accountingService.getConfig('INVENTORY_COGS_ACCOUNT') || '6135';
        const ADJ_ACCOUNT = await accountingService.getConfig('INVENTORY_ADJUSTMENT_ACCOUNT') || '3205';

        const lines = [];
        const value = Math.abs(movement.quantity * movement.unitPrice);

        if (movement.type === 'Out') {
            // Credit Inventory (Asset decreases)
            lines.push({ accountCode: INVENTORY_ACCOUNT, debit: 0, credit: value, notes: `Salida Inventario: ${movement.reason}` });
            // Debit Cost (Expense increases)
            lines.push({ accountCode: COGS_ACCOUNT, debit: value, credit: 0, notes: 'Costo por consumo/venta' });
        } else if (movement.type === 'In') {
            // Debit Inventory
            lines.push({ accountCode: INVENTORY_ACCOUNT, debit: value, credit: 0, notes: `Entrada Inventario: ${movement.reason}` });
            // Credit Adjustment/Income or Provider (simplified to Equity/Other for now if no purchase order)
            lines.push({ accountCode: ADJ_ACCOUNT, debit: 0, credit: value, notes: 'Ajuste inventario / Donación / Carga Inicial' });
        }

        await accountingService.createJournalEntry({
            date: movement.date,
            description: `Movimiento Inventario ${movement.type}`,
            referenceId: movement.id,
            referenceType: 'InventoryMovement',
            lines
        }, tx);
    },

    getAccounts: async (): Promise<Account[]> => {
        const accounts = await prisma.account.findMany();
        return accounts.map(acc => ({
            code: acc.code,
            name: acc.name,
            type: acc.type as any,
            balance: acc.balance
        }));
    },

    getPayrolls: async (): Promise<Payroll[]> => {
        const payrolls = await prisma.payroll.findMany();
        return payrolls.map(p => ({
            id: p.id,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            period: p.period,
            basicSalary: p.basicSalary,
            healthDeduction: p.healthDeduction,
            pensionDeduction: p.pensionDeduction,
            netPay: p.netPay,
            status: p.status as any
        }));
    },

    calculatePayroll: async (period: string): Promise<Payroll[]> => {
        // Business Rule: 4% health, 4% pension
        const newPayrolls = MOCK_EMPLOYEES.map(emp => {
            const health = emp.salary * 0.04;
            const pension = emp.salary * 0.04;
            return {
                employeeId: emp.id,
                employeeName: emp.name,
                period,
                basicSalary: emp.salary,
                healthDeduction: health,
                pensionDeduction: pension,
                netPay: emp.salary - health - pension,
                status: 'Pending'
            };
        });

        // Save to DB
        await prisma.$transaction(async (tx) => {
            for (const p of newPayrolls) {
                const savedPayroll = await tx.payroll.create({ data: p });

                // Auto-Record Accounting for Payroll
                // Debit Expense (Salaries 5105)
                // Credit Liability (Wages Payable 2505) + Withholdings (2370)
                // This is a simplified example
                const SALARY_EXPENSE = '5105';
                const WAGES_PAYABLE = '2505';

                await accountingService.createJournalEntry({
                    date: new Date(),
                    description: `Nomina ${p.period} - ${p.employeeName}`,
                    referenceId: savedPayroll.id,
                    referenceType: 'Payroll',
                    lines: [
                        { accountCode: SALARY_EXPENSE, debit: p.basicSalary, credit: 0, notes: 'Gasto Sueldo' },
                        { accountCode: WAGES_PAYABLE, debit: 0, credit: p.basicSalary, notes: 'Salarios por Pagar' },
                        // Note: In real world, we separate deductions (Health/Pension) to 2370/2380. 
                        // Keeping it simple balanced for now.
                    ]
                }, tx);
            }
        });

        // Fetch back to get actual data from DB
        const saved = await prisma.payroll.findMany({ where: { period } });
        return saved.map(p => ({
            id: p.id,
            employeeId: p.employeeId,
            employeeName: p.employeeName,
            period: p.period,
            basicSalary: p.basicSalary,
            healthDeduction: p.healthDeduction,
            pensionDeduction: p.pensionDeduction,
            netPay: p.netPay,
            status: p.status as any
        }));
    },

    getJournalEntries: async () => {
        return await prisma.journalEntry.findMany({
            orderBy: { date: 'desc' },
            include: {
                lines: {
                    include: { account: true }
                }
            }
        });
    }
};
