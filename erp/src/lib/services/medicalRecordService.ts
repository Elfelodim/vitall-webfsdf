import { prisma } from '@/lib/prisma';

export interface PatientHistory {
    consultations: any[];
    labResults: any[];
    diagnosticImages: any[];
    machineScans: any[];
    hospitalizations: any[];
}

export const medicalRecordService = {
    getPatientFullHistory: async (patientDocument: string): Promise<PatientHistory> => {
        const [consultations, labResults, diagnosticImages, machineScans, hospitalizations] = await Promise.all([
            prisma.medicalRecord.findMany({
                where: { patientDocument },
                include: { diagnoses: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.labResult.findMany({
                where: { patientDocument },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.diagnosticImage.findMany({
                where: { patientDocument },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.machineScan.findMany({
                where: { patientDocument },
                orderBy: { performedAt: 'desc' }
            }),
            prisma.hospitalization.findMany({
                where: { patientDocument },
                include: { evolutions: true, epicrisis: true },
                orderBy: { admissionDate: 'desc' }
            })
        ]);

        return {
            consultations,
            labResults,
            diagnosticImages,
            machineScans,
            hospitalizations
        };
    },

    getPatientChronology: async (patientDocument: string) => {
        const [consultations, hospitalizations] = await Promise.all([
            prisma.medicalRecord.findMany({
                where: { patientDocument },
                include: { diagnoses: true },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.hospitalization.findMany({
                where: { patientDocument },
                include: {
                    evolutions: { orderBy: { createdAt: 'desc' } },
                    epicrisis: true
                },
                orderBy: { admissionDate: 'desc' }
            })
        ]);

        const events = [
            ...consultations.map(c => ({
                id: c.id,
                type: 'Consultation',
                date: c.createdAt,
                title: 'Consulta Externa',
                description: c.reasonForVisit,
                doctor: c.doctorName,
                details: c
            })),
            ...hospitalizations.map(h => ({
                id: h.id,
                type: 'Hospitalization',
                admissionDate: h.admissionDate,
                dischargeDate: h.epicrisis?.date || h.dischargeDate,
                title: `Hospitalización - Cama ${h.bedNumber}`,
                description: h.admissionDiagnosis,
                doctor: h.doctorInCharge,
                status: h.status,
                evolutions: h.evolutions,
                epicrisis: h.epicrisis,
                details: h
            }))
        ].sort((a, b) => {
            const dateA = (a as any).admissionDate || (a as any).date;
            const dateB = (b as any).admissionDate || (b as any).date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
        });

        return events;
    },

    saveConsultation: async (data: any) => {
        return prisma.medicalRecord.create({
            data: {
                patientDocument: data.patientDocument,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                reasonForVisit: data.reasonForVisit,
                clinicalHistory: data.clinicalHistory,
                bloodPressure: data.bloodPressure,
                heartRate: data.heartRate,
                respiratoryRate: data.respiratoryRate,
                temperature: data.temperature,
                weight: data.weight,
                height: data.height,
                physicalExamFindings: data.physicalExamFindings,
                treatmentPlan: data.treatmentPlan,
                observations: data.observations,
                diagnoses: {
                    create: data.diagnoses // Array of { code, description, type }
                }
            }
        });
    },

    saveLabResult: async (data: any) => {
        return prisma.labResult.create({ data });
    },

    saveDiagnosticImage: async (data: any) => {
        return prisma.diagnosticImage.create({ data });
    },

    saveMachineScan: async (data: any) => {
        return prisma.machineScan.create({ data });
    },

    // --- Hospitalization Methods ---

    saveAdmission: async (data: any) => {
        return prisma.hospitalization.create({
            data: {
                patientDocument: data.patientDocument,
                bedNumber: data.bedNumber,
                admissionDiagnosis: data.admissionDiagnosis,
                doctorInCharge: data.doctorInCharge,
                status: 'Active'
            }
        });
    },

    saveEvolution: async (data: any) => {
        return prisma.evolution.create({
            data: {
                hospitalizationId: data.hospitalizationId,
                note: data.note,
                doctorName: data.doctorName,
                bloodPressure: data.bloodPressure,
                heartRate: data.heartRate,
                temperature: data.temperature
            }
        });
    },

    saveEpicrisis: async (data: any) => {
        // Create epicrisis and close hospitalization
        const [epicrisis] = await Promise.all([
            prisma.epicrisis.create({
                data: {
                    hospitalizationId: data.hospitalizationId,
                    summary: data.summary,
                    treatments: data.treatments,
                    recommendations: data.recommendations
                }
            }),
            prisma.hospitalization.update({
                where: { id: data.hospitalizationId },
                data: {
                    status: 'Discharged',
                    dischargeDate: new Date()
                }
            })
        ]);
        return epicrisis;
    }
};
