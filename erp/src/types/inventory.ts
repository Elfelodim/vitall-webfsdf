export type ProductType = 'Medicine' | 'MedicalDevice' | 'Supply';
export type Unit = 'Tablet' | 'Box' | 'Bottle' | 'Unit' | 'Ampoule';

export interface Batch {
    id: string;
    batchNumber: string;
    expirationDate: string; // ISO Date
    quantity: number;
}

export interface Product {
    id: string;
    code: string; // CUM or internal code
    name: string;
    type: ProductType;
    category: string;
    unit: Unit;
    minStock: number;
    currentStock: number;
    price: number;
    batches: Batch[];
    status: 'Active' | 'Inactive';
}

export interface InventoryMovement {
    id: string;
    productId: string;
    type: 'In' | 'Out' | 'Adjustment';
    quantity: number;
    unitPrice: number;
    totalValue: number;
    reason: string;
    date: string;
    reference?: string;
}
