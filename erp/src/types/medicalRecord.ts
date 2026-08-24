

export interface Vitals {
    bloodPressure: string; // e.g. "120/80"
    heartRate: number;
    respiratoryRate: number;
    temperature: number;
    weight: number; // kg
    height: number; // cm
    bmi?: number;
}

export interface Diagnosis {
    code: string; // CIE-10
    description: string;
    type: 'Principal' | 'Relacionado';
}

export interface Consultation {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    date: string; // ISO Date

    // Anamnesis
    reasonForConsultation: string;
    currentIllness: string;

    // Physical Exam
    vitals: Vitals;
    physicalExamFindings: string;

    // Assessment & Plan
    diagnosis: Diagnosis[];
    treatmentPlan: string;
    observations?: string;
}

// Mock CIE-10 Data
export const MOCK_CIE10 = [
    { code: 'R509', description: 'Fiebre, no especificada' },
    { code: 'J00', description: 'Rinofaringitis aguda [resfriado común]' },
    { code: 'R104', description: 'Otros dolores abdominales y los no especificados' },
    { code: 'I10X', description: 'Hipertensión esencial (primaria)' },
    { code: 'E119', description: 'Diabetes mellitus no insulinodependiente sin complicaciones' },
];
