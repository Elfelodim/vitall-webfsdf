export type DocumentType = 'CC' | 'TI' | 'RC' | 'CE' | 'PA' | 'AS';

export type Sex = 'M' | 'F';

export interface Patient {
    id: string;
    documentType: DocumentType;
    documentNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string; // ISO Date
    sex: Sex;
    address: string;
    phone: string;
    email: string;
    eps: string; // Health Insurance Provider
    regime: 'Contributivo' | 'Subsidiado' | 'Especial';
    status: 'Active' | 'Inactive';
    createdAt: string;
}

export const DOCUMENT_TYPES: { value: DocumentType; label: string }[] = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'RC', label: 'Registro Civil' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PA', label: 'Pasaporte' },
];
