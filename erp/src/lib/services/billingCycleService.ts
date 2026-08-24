
import prisma from '@/lib/prisma';
import { format } from 'date-fns';

export const billingCycleService = {

    /**
     * Create a new Submission (Radicación) for a set of invoices
     */
    async createSubmission(data: { insurerId: string; invoiceIds: string[]; stickerNumber: string; carrier?: string; trackingNumber?: string }) {
        return await prisma.$transaction(async (tx) => {
            // 1. Create Submission
            const submission = await tx.billSubmission.create({
                data: {
                    stickerNumber: data.stickerNumber,
                    insurerId: data.insurerId,
                    carrier: data.carrier,
                    trackingNumber: data.trackingNumber,
                    status: 'Submitted'
                }
            });

            // 2. Link Invoices
            await tx.invoice.updateMany({
                where: { id: { in: data.invoiceIds } },
                data: {
                    submissionId: submission.id,
                    status: 'Submitted' // Or keep 'Issued' and trust submissionId? Usually 'Submitted' or 'Radicado'
                }
            });

            return submission;
        });
    },

    /**
     * Generate RIPS JSON (Res 2275 - 2024 Strict)
     * Supports generating from a Submission ID OR a list of Invoices
     */
    async generateRipsJson(submissionId?: string, invoiceIds?: string[]) {
        let invoices: any[] = [];
        const entityNit = "900123456"; // Default or fetch from config

        if (submissionId) {
            const submission = await prisma.billSubmission.findUnique({
                where: { id: submissionId },
                include: {
                    invoices: {
                        include: {
                            patient: true,
                            items: true,
                        }
                    }
                }
            });
            if (!submission) throw new Error('Radicación no encontrada');
            invoices = submission.invoices;
        } else if (invoiceIds && invoiceIds.length > 0) {
            invoices = await prisma.invoice.findMany({
                where: { id: { in: invoiceIds } },
                include: {
                    patient: true,
                    items: true
                }
            });
        } else {
            throw new Error('Debe proporcionar un ID de Radicación o Lista de Facturas');
        }

        // Structure based on Res 2275 - 2024 (RIPS JSON)

        const usuarios = invoices.map((inv: any) => {
            // Basic patient data
            return {
                "tipoDocumentoIdentificacion": inv.patient.documentType,
                "numDocumentoIdentificacion": inv.patient.documentNumber,
                "tipoUsuario": "01", // Default: Contributivo (needs dynamic from Patient.regime)
                "fechaNacimiento": format(inv.patient.dateOfBirth, 'yyyy-MM-dd'),
                "codSexo": inv.patient.sex === 'M' ? 'M' : 'F',
                "codPaisResidencia": "170",
                "codMunicipioResidencia": "05001", // TODO: Add to patient schema
                "codZonaTerritorialResidencia": inv.patient.zone === 'Urbana' ? '01' : '02',
                "incapacidad": "NO",
                "codPaisOrigen": "170",
                "servicios": {
                    "consultas": inv.items.filter((i: any) => i.code.startsWith('89')).map((item: any) => ({
                        "codPrestador": "123456789001",
                        "fechaInicioAtencion": format(inv.date, 'yyyy-MM-dd HH:mm'),
                        "numAutorizacion": null,
                        "codConsulta": item.code,
                        "modalidadGrupoServicioTecSal": "01",
                        "grupoServicios": "01",
                        "codServicio": "01",
                        "finalidadTecnologiaSalud": "44",
                        "causaMotivoAtencion": "21",
                        "codDiagnosticoPrincipal": "Z000",
                        "codDiagnosticoRelacionado1": null,
                        "codDiagnosticoRelacionado2": null,
                        "codDiagnosticoRelacionado3": null,
                        "tipoDiagnosticoPrincipal": "01",
                        "valorPagoModerador": 0,
                        "valorFEVPagoModerador": 0,
                        "valorServicio": item.total || (item.unitPrice * item.quantity)
                    })),
                    "procedimientos": inv.items.filter((i: any) => !i.code.startsWith('89')).map((item: any) => ({
                        "codPrestador": "123456789001",
                        "fechaInicioAtencion": format(inv.date, 'yyyy-MM-dd HH:mm'),
                        "idMipres": null,
                        "numAutorizacion": null,
                        "codProcedimiento": item.code,
                        "viaIngresoServicioSalud": "01",
                        "modalidadGrupoServicioTecSal": "01",
                        "grupoServicios": "01",
                        "codServicio": "01",
                        "finalidadTecnologiaSalud": "44",
                        "tipoDocumentoIdentificacion": inv.patient.documentType,
                        "numDocumentoIdentificacion": inv.patient.documentNumber,
                        "codDiagnosticoPrincipal": "Z000",
                        "codDiagnosticoRelacionado1": null,
                        "tipoDiagnosticoPrincipal": "01",
                        "valorPagoModerador": 0,
                        "valorFEVPagoModerador": 0,
                        "valorServicio": item.total || (item.unitPrice * item.quantity)
                    }))
                }
            };
        });

        const rips = {
            "numDocumentoIdentificacionObligado": entityNit,
            "numFacturaVenta": invoices.map((i: any) => i.invoiceNumber).join(','),
            "tipoNota": null,
            "numNota": null,
            "usuarios": usuarios
        };

        return rips;
    },

    /**
     * Register a Glosa (Dispute)
     */
    async registerGlosa(data: { invoiceId: string; code: string; description: string; value: number }) {
        return await prisma.$transaction(async (tx) => {
            const glosa = await tx.glosa.create({
                data: {
                    invoiceId: data.invoiceId,
                    code: data.code,
                    description: data.description,
                    value: data.value,
                    balance: data.value,
                    status: 'Open'
                }
            });

            await tx.invoice.update({
                where: { id: data.invoiceId },
                data: { glosaStatus: 'Partial' } // Or logic to determine if Total
            });

            return glosa;
        });
    },

    /**
    * Respond to a Glosa (Accept / Refute)
    */
    async respondGlosa(glosaId: string, action: 'Accept' | 'Refute', acceptanceNote: string, refusalNote: string, acceptedValue: number = 0) {
        return await prisma.$transaction(async (tx) => {
            // 1. Get current glosa
            const currentGlosa = await tx.glosa.findUnique({ where: { id: glosaId } });
            if (!currentGlosa) throw new Error('Glosa no encontrada');

            let creditNote = null;
            let finalStatus = action;
            // Determine status based on values
            if (action === 'Accept') {
                if (acceptedValue > 0 && acceptedValue < currentGlosa.value) {
                    finalStatus = 'Partial';
                } else if (acceptedValue === currentGlosa.value) {
                    finalStatus = 'Accepted';
                }
                 // If acceptedValue = 0, it should be Refuted technically, handled by frontend sending 'Refute' action
            }

            // 2. If Accepted (Total or Partial), create Credit Note & Update Balance
            if (acceptedValue > 0) {
                creditNote = await tx.creditNote.create({
                    data: {
                        invoiceId: currentGlosa.invoiceId,
                        number: `NC-GLOSA-${currentGlosa.code}-${Date.now().toString().slice(-4)}`,
                        value: acceptedValue,
                        reason: `Aceptación Glosa ${currentGlosa.code}`,
                        dianStatus: 'Pending',
                        cufe: null
                    }
                });

                await tx.invoice.update({
                    where: { id: currentGlosa.invoiceId },
                    data: {
                        currentBalance: { decrement: acceptedValue }
                    }
                });
            }

            // Construct combined response text for the single field
            let fullResponse = '';
            if (acceptanceNote) fullResponse += `[ACEPTACIÓN]: ${acceptanceNote}\n`;
            if (refusalNote) fullResponse += `[REFUTACIÓN]: ${refusalNote}`;

            // 3. Update Glosa Status
            const updatedGlosa = await tx.glosa.update({
                where: { id: glosaId },
                data: {
                    status: finalStatus,
                    acceptedValue: acceptedValue,
                    responseDate: new Date(),
                    response: fullResponse.trim() // Ensure schema has this field or use description
                }
            });

            return { glosa: updatedGlosa, creditNote };
        });
    }
};
