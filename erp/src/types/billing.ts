export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'Cancelled';

export interface InvoiceItem {
    id: string;
    code: string; // CUPS code or internal
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    patientId: string;
    patientName: string;
    payerId: string; // EPS or Insurer
    payerName: string;
    date: string; // ISO Date
    dueDate: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    ripsGenerated: boolean;
}

export interface RIPSFile {
    code: 'CT' | 'AF' | 'US' | 'AD' | 'AC' | 'AP' | 'AM' | 'AT' | 'AN' | 'AU' | 'AH';
    name: string;
    recordCount: number;
    generatedAt: string;
}
