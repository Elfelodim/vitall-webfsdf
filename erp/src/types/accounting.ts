export type AccountValues = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'Cost';
export type EntryType = 'Debit' | 'Credit';

export interface Account {
    code: string; // PUC Code e.g. "1105"
    name: string;
    type: AccountValues;
    balance: number;
}

export interface JournalEntryLine {
    accountId: string;
    accountCode: string;
    accountName: string;
    description: string;
    debit: number;
    credit: number;
}

export interface JournalEntry {
    id: string;
    date: string;
    description: string;
    reference: string; // Document Number
    lines: JournalEntryLine[];
    status: 'Draft' | 'Posted';
}

export interface Employee {
    id: string;
    name: string;
    document: string;
    salary: number;
    position: string;
    startDate: string;
}

export interface Payroll {
    id: string;
    employeeId: string;
    employeeName: string;
    period: string; // e.g. "2025-01"
    basicSalary: number;
    // Deductions
    healthDeduction: number; // 4%
    pensionDeduction: number; // 4%
    // Net
    netPay: number;
    status: 'Pending' | 'Paid';
}
