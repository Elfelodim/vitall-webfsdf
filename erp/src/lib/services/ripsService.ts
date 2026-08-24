import { prisma } from '@/lib/prisma';
import { Invoice, Patient, MedicalRecord } from '@prisma/client';

// Helper types for RIPS JSON structure (Simplified for MVP)
interface RipsUser {
    tipoDocumentoIdentificacion: string;
    numDocumentoIdentificacion: string;
    tipoUsuario: string;
    fechaNacimiento: string; // YYYY-MM-DD
    codSexo: string;
    codPaisResidencia: string;
    codMunicipioResidencia: string;
    codZonaTerritorialResidencia: string;
    incapacidad: string; // "NO"
    codPaisOrigen: string;
    servicios: {
        consultas?: RipsConsultation[];
        procedimientos?: any[]; // TODO
        urgencias?: any[];
        hospitalizacion?: any[];
        recienNacidos?: any[];
        medicamentos?: any[];
        otrosServicios?: any[];
    };
}

interface RipsConsultation {
    codPrestador: string;
    fechaInicioAtencion: string; // YYYY-MM-DD HH:mm
    numAutorizacion: string | null;
    codConsulta: string; // CUPS
    modalidadAtencion: string;
    grupoServicios: string;
    codServicio: string;
    finalidadTecnologiaSalud: string;
    causaMotivoAtencion: string;
    codDiagnosticoPrincipal: string; // CIE-10
    codDiagnosticoRelacionado1: string | null;
    codDiagnosticoRelacionado2: string | null;
    codDiagnosticoRelacionado3: string | null;
    tipoDiagnosticoPrincipal: string;
    codDiagnosticoOdontologico: string | null;
    valorPagoModerador: number;
    valorServicio: number;
    consecutivo: number;
}

interface RipsTransaction {
    numDocumentoIdObligado: string;
    numFacturaVenta: string;
    tipoNota: null;
    numNota: null;
    usuarios: RipsUser[];
}

export const ripsService = {
    /**
     * Generate RIPS JSON for a single Invoice.
     * In the real world, a transmission can contain multiple invoices, 
     * but usually it's one JSON per Invoice or grouped by validation/submission.
     * We will generate one JSON object per Invoice for simplicity in this MVP.
     */
    generateRipsJson: async (invoiceId: string): Promise<RipsTransaction> => {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                patient: true,
                items: true,
            }
        });

        if (!invoice) throw new Error('Invoice not found');

        // Fetch Related Clinical Records (Consultations)
        // We link them via patient and date matching or specific relation if available.
        // For accurate RIPS, we really need a direct link between Invoice Items and Medical Records (ServiceOrder).
        // Since we don't have a rigid InvoiceItem -> ClinicalRecord link yet (except via ServiceOrder), 
        // we will infer based on the Patient + Date logic or use the ServiceOrder if present.

        let consultations: MedicalRecord[] = [];

        // Strategy: 
        // 1. If invoice has serviceOrderId, fetch records from there.
        // 2. Fallback: Find records involved in the invoice timeframe (Same Day).

        const startOfDay = new Date(invoice.date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(invoice.date); endOfDay.setHours(23, 59, 59, 999);

        if (invoice.serviceOrderId) {
            // Find records linked to this service order context? 
            // Currently MedicalRecord doesn't link to ServiceOrder directly.
            // We use the patient + date heuristic for now or modify schema later.
            consultations = await prisma.medicalRecord.findMany({
                where: {
                    patientDocument: invoice.patientDocument,
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: { diagnoses: true }
            });
        } else {
            consultations = await prisma.medicalRecord.findMany({
                where: {
                    patientDocument: invoice.patientDocument,
                    createdAt: {
                        gte: startOfDay,
                        lte: endOfDay
                    }
                },
                include: { diagnoses: true }
            });
        }

        // Map Patient
        const p = invoice.patient;

        // Map Consultations
        const ripsConsultations: RipsConsultation[] = consultations.map((c, index) => {
            const diagPrincipal = (c as any).diagnoses.find((d: any) => d.type === 'Principal') || (c as any).diagnoses[0];
            const related = (c as any).diagnoses.filter((d: any) => d.id !== diagPrincipal?.id);

            return {
                codPrestador: "123456789001", // Should be config
                fechaInicioAtencion: c.createdAt.toISOString().replace('T', ' ').substring(0, 16),
                numAutorizacion: null,
                codConsulta: "890201", // Default General Consultation if not found in items. ideally match invoice item.
                modalidadAtencion: (c as any).modality || "01",
                grupoServicios: "01", // Consulta Externa
                codServicio: (c as any).serviceCode || "346", // Medicina General
                finalidadTecnologiaSalud: (c as any).purpose || "10",
                causaMotivoAtencion: (c as any).cause || "13",
                codDiagnosticoPrincipal: diagPrincipal?.code || "Z000",
                codDiagnosticoRelacionado1: related[0]?.code || null,
                codDiagnosticoRelacionado2: related[1]?.code || null,
                codDiagnosticoRelacionado3: related[2]?.code || null,
                tipoDiagnosticoPrincipal: "01", // Impresion diagnostica
                codDiagnosticoOdontologico: null,
                valorPagoModerador: 0, // Can extract from PaymentReceipt
                valorServicio: invoice.items.find(i => i.code === "890201")?.unitPrice || 0,
                consecutivo: index + 1
            };
        });

        // Construct User Object
        const ripsUser: RipsUser = {
            tipoDocumentoIdentificacion: p.documentType,
            numDocumentoIdentificacion: p.documentNumber,
            tipoUsuario: mapUserType(p.userType || ""),
            fechaNacimiento: p.dateOfBirth, // Ensure format YYYY-MM-DD
            codSexo: p.sex === 'M' ? 'M' : 'F',
            codPaisResidencia: "170", // Colombia
            codMunicipioResidencia: "11001", // Bogota (Mock default)
            codZonaTerritorialResidencia: p.zone === 'Rural' ? '02' : '01',
            incapacidad: "NO",
            codPaisOrigen: "170",
            servicios: {
                consultas: ripsConsultations.length > 0 ? ripsConsultations : undefined
            }
        };

        return {
            numDocumentoIdObligado: "900000000", // NIT IPS
            numFacturaVenta: invoice.invoiceNumber,
            tipoNota: null,
            numNota: null,
            usuarios: [ripsUser]
        };
    }
};

function mapUserType(type: string): string {
    const map: Record<string, string> = {
        'Contributivo': '01',
        'Subsidiado': '02',
        'Vinculado': '03',
        'Particular': '04',
        'Otro': '05'
    };
    return map[type] || '05';
}
