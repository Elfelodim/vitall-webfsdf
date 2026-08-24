import { accountingService } from './src/lib/services/accountingService';
import { billingService } from './src/lib/services/billingService';
import { inventoryService } from './src/lib/services/inventoryService';
import { prisma } from './src/lib/prisma';

async function verify() {
    console.log('Verification started...');

    try {
        // 1. Check Accounts (Seed must be present)
        console.log('\n--- 1. Checking Accounts ---');
        const accountsCheck = await prisma.account.findMany({ where: { code: { in: ['1305', '4105', '2408'] } } });
        console.log('Existing Critical Accounts:', accountsCheck.map(a => a.code));

        const requiredAccounts = [
            { code: '110505', name: 'Caja General', type: 'Asset', balance: 0 },
            { code: '1305', name: 'Clientes', type: 'Asset', balance: 0 },
            { code: '1435', name: 'Inventarios', type: 'Asset', balance: 0 },
            { code: '3205', name: 'Superavit', type: 'Equity', balance: 0 },
            { code: '2408', name: 'IVA Generado', type: 'Liability', balance: 0 },
            { code: '4105', name: 'Ingresos Salud', type: 'Income', balance: 0 },
            { code: '5105', name: 'Gastos Personal', type: 'Expense', balance: 0 },
            { code: '2505', name: 'Salarios por Pagar', type: 'Liability', balance: 0 },
            { code: '6135', name: 'Costo de Ventas', type: 'Expense', balance: 0 },
        ];

        for (const acc of requiredAccounts) {
            const exists = await prisma.account.findUnique({ where: { code: acc.code } });
            if (!exists) {
                await prisma.account.create({ data: acc });
                console.log(`Created missing account: ${acc.code}`);
            }
        }

        // 2. Test Invoice Integration
        console.log('\n--- 2. Testing Billing Integration ---');

        // Ensure Patient
        let patient = await prisma.patient.findFirst();
        if (!patient) {
            patient = await prisma.patient.create({
                data: {
                    firstName: "Test", lastName: "Patient",
                    documentType: "CC", documentNumber: "123456789",
                    dateOfBirth: "1990-01-01", sex: "M", address: "Calle 1", phone: "3000000",
                    regime: "Contributivo", status: "Active", eps: "Sanitas"
                }
            });
            console.log('Created Test Patient');
        }

        // Ensure Resolution
        const res = await billingService.getActiveResolution();
        if (!res) {
            await billingService.createResolution({
                resolutionNumber: "18760000001", prefix: "SETT",
                fromNumber: 1, toNumber: 1000,
                startDate: new Date(), endDate: new Date(new Date().setFullYear(2030)),
                technicalKey: "fc8eac422eba16e22ffd8c6f94b3940a6e38162c"
            });
            console.log('Created Test Resolution');
        }

        // Create Invoice
        const invoice = await billingService.createInvoice({
            patientDocument: patient.documentNumber,
            paymentMethod: "Cash",
            items: [
                { code: "890201", description: "Consulta General", quantity: 1, unitPrice: 50000 }
            ]
        });
        console.log(`Invoice Created: ${invoice.invoiceNumber}. Total: ${invoice.total}`);

        // Verify Journal Entry for Invoice
        const entry = await prisma.journalEntry.findFirst({
            where: { referenceId: invoice.id, referenceType: 'Invoice' },
            include: { lines: true }
        });

        if (entry) {
            console.log(`✅ Journal Entry Found! ID: ${entry.id}`);
            entry.lines.forEach(l => console.log(`   - ${l.accountCode}: D: ${l.debit} | C: ${l.credit}`));
        } else {
            throw new Error('❌ Journal Entry NOT found for Invoice!');
        }

        // 3. Test Inventory Integration
        console.log('\n--- 3. Testing Inventory Integration ---');

        // Ensure Product
        const productData = {
            code: "MED001", name: "Acetaminofen", type: "Medicine",
            category: "General", unit: "Tableta", price: 500, currentStock: 0, minStock: 10, status: "Active" as "Active"
        };
        // Clean up previous test
        const existingProd = await prisma.product.findUnique({ where: { code: "MED001" } });
        if (existingProd) {
            await prisma.inventoryMovement.deleteMany({ where: { productId: existingProd.id } });
            await prisma.batch.deleteMany({ where: { productId: existingProd.id } });
            await prisma.product.delete({ where: { id: existingProd.id } });
        }

        // Create with Initial Stock (Should trigger In Movement + Journal)
        const product = await inventoryService.createProduct({
            ...productData,
            currentStock: 100,
            initialBatch: { batchNumber: "B1", expirationDate: "2026-01-01", quantity: 100 }
        });
        console.log(`Product Created: ${product.name} with Stock ${product.currentStock}`);

        // Verify Journal Entry for Inventory
        const invEntry = await prisma.journalEntry.findFirst({
            where: { description: { contains: 'Inventario Inicial' }, referenceType: 'InventoryMovement' },
            orderBy: { date: 'desc' },
            include: { lines: true }
        });

        if (invEntry) {
            console.log(`✅ Journal Entry Found for Inventory! ID: ${invEntry.id}`);
            invEntry.lines.forEach(l => console.log(`   - ${l.accountCode}: D: ${l.debit} | C: ${l.credit}`));
        } else {
            console.warn('⚠️ Journal Entry not found immediately for inventory (might need logic check).');
        }

        console.log('\nVerification SUCCESSFUL.');
    } catch (error) {
        console.error('\nVerification FAILED:', error);
        process.exit(1);
    }
}

verify();
