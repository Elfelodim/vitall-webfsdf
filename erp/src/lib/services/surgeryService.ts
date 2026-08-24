import { prisma } from '../prisma';

export const surgeryService = {
    createReport: async (data: any) => {
        return await prisma.surgeryReport.create({
            data: {
                patientDocument: data.patientDocument,
                date: new Date(data.date),
                surgeonName: data.surgeonName,
                assistantName: data.assistantName,
                anesthesiologistName: data.anesthesiologistName,
                startTime: data.startTime,
                endTime: data.endTime,
                surgeryType: data.surgeryType,
                preOpDiagnosis: data.preOpDiagnosis,
                postOpDiagnosis: data.postOpDiagnosis,
                procedureName: data.procedureName,
                procedureCode: data.procedureCode,
                description: data.description,
                findings: data.findings,
                complications: data.complications
            }
        });
    },

    getReportsByPatient: async (patientDocument: string) => {
        return await prisma.surgeryReport.findMany({
            where: { patientDocument },
            include: { anesthesiaRecord: true },
            orderBy: { date: 'desc' }
        });
    },

    // Create Anesthesia Record linked to a Surgery Report
    createAnesthesiaRecord: async (surgeryReportId: string, data: any) => {
        return await prisma.anesthesiaRecord.create({
            data: {
                surgeryReportId,
                anesthesiologist: data.anesthesiologist,
                anesthesiaType: data.anesthesiaType,
                asaScore: data.asaScore,
                startTime: data.startTime,
                endTime: data.endTime,
                vitalsLog: JSON.stringify(data.vitalsLog || []),
                medications: JSON.stringify(data.medications || []),
                observations: data.observations
            }
        });
    }
};
