import { ripsService } from './src/lib/services/ripsService';
import { prisma } from './src/lib/prisma';
import fs from 'fs';

async function verify() {
    console.log('--- Verifying RIPS Generation ---');

    try {
        // 1. Create Test Patient
        const patientRaw = {
            firstName: "Rips", lastName: "Tester",
            documentType: "CC", documentNumber: "99999999",
            dateOfBirth: "1990-01-01", sex: "F", address: "Calle Fake 123", phone: "3001234567",
            regime: "Contributivo", userType: "Contributivo", zone: "Urbana",
            email: "rips@test.com", status: "Active", eps: "Sanitas"
        };

        let patient = await prisma.patient.findUnique({ where: { documentNumber: "99999999" } });
        if (!patient) {
            patient = await prisma.patient.create({ data: patientRaw });
        } else {
            patient = await prisma.patient.update({ where: { id: patient.id }, data: patientRaw });
        }

        // 2. Create Medical Record (Using standard fields, expecting defaults for new ones if Client not updated)
        const record = await prisma.medicalRecord.create({
            data: {
                patientDocument: patient.documentNumber,
                doctorId: "DOC001", doctorName: "Dr. Rips",
                reasonForVisit: "Dolor de cabeza",
                clinicalHistory: "Paciente refiere cefalea intensa...",
                physicalExamFindings: "Normal",
                treatmentPlan: "Acetaminofen",
                // Note: We cannot pass 'modality' etc here if Client is outdated, so we rely on DB defaults (or service defaults)
                diagnoses: {
                    create: [
                        { code: "R51", description: "Cefalea", type: "Principal" }
                    ]
                }
            }
        });
        console.log('Medical Record Created:', record.id);

        // 3. Create Invoice
        // Check resolution
        const resolution = await prisma.billingResolution.findFirst();
        if (!resolution) throw new Error("No resolution found");

        const invoice = await prisma.invoice.create({
            data: {
                patientDocument: patient.documentNumber,
                invoiceNumber: "RIPS-TEST-001",
                dueDate: new Date(),
                subtotal: 50000, tax: 0, total: 50000,
                status: "Issued",
                items: {
                    create: [
                        { code: "890201", description: "Consulta General", quantity: 1, unitPrice: 50000, total: 50000 }
                    ]
                }
            }
        });
        console.log('Invoice Created:', invoice.invoiceNumber);

        // 4. Generate RIPS
        const ripsJson = await ripsService.generateRipsJson(invoice.id);

        console.log('RIPS JSON Generated Successfully.');
        console.log(JSON.stringify(ripsJson, null, 2));

        // 5. Basic Validation
        if (ripsJson.numFacturaVenta !== invoice.invoiceNumber) throw new Error("Invoice Number mismatch");
        if (ripsJson.usuarios.length !== 1) throw new Error("Should have 1 user");
        if (ripsJson.usuarios[0].servicios.consultas?.length !== 1) throw new Error("Should have 1 consultation");

        const consulta = ripsJson.usuarios[0].servicios.consultas[0];
        if (consulta.codDiagnosticoPrincipal !== "R51") throw new Error("Diagnosis mismatch");

        console.log('✅ Validation PASSED');

        // Cleanup
        await prisma.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
        await prisma.invoice.delete({ where: { id: invoice.id } });
        await prisma.diagnosis.deleteMany({ where: { medicalRecordId: record.id } });
        await prisma.medicalRecord.delete({ where: { id: record.id } });
        await prisma.patient.delete({ where: { id: patient.id } });

    } catch (e) {
        console.error('Verification FAILED:', e);
        process.exit(1);
    }
}

verify();
