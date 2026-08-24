'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export default function BulkImportButton() {
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                // Map Excel rows to API format
                const products = jsonData.map((row: any) => ({
                    code: String(row.codigo || row.code),
                    name: String(row.nombre || row.name),
                    category: String(row.categoria || row.category),
                    type: row.tipo || row.type || 'Medicine',
                    unit: row.unidad || row.unit || 'Unit',
                    price: parseFloat(row.precio || row.price) || 0,
                    minStock: parseInt(row.stock_minimo || row.min_stock) || 5,
                    currentStock: parseInt(row.cantidad || row.quantity) || 0,
                    status: 'Active',
                    initialBatch: {
                        batchNumber: String(row.lote || row.batch_number),
                        expirationDate: formatDate(row.vencimiento || row.expiration_date),
                        quantity: parseInt(row.cantidad || row.quantity) || 0
                    }
                }));

                const res = await fetch('/api/inventory/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(products)
                });

                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.message || 'Error en la carga masiva');
                }

                alert(`¡Se han cargado ${products.length} productos exitosamente!`);
                router.refresh();
            } catch (error: any) {
                console.error('Bulk Import Error:', error);
                alert('Error: ' + error.message);
            } finally {
                setLoading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const formatDate = (date: any) => {
        if (!date) return new Date().toISOString().split('T')[0];
        // Handle Excel numeric dates
        if (typeof date === 'number') {
            const d = new Date((date - 25569) * 86400 * 1000);
            return d.toISOString().split('T')[0];
        }
        return new Date(date).toISOString().split('T')[0];
    };

    const downloadTemplate = () => {
        const headers = [
            {
                codigo: 'MED-001',
                nombre: 'Producto Ejemplo',
                categoria: 'Medicamentos',
                tipo: 'Medicine',
                unidad: 'Box',
                precio: 15000,
                stock_minimo: 10,
                lote: 'LOT-001',
                vencimiento: '2026-12-31',
                cantidad: 50
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(headers);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Plantilla Inventario");

        // Col widths
        worksheet['!cols'] = [
            { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
            { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }
        ];

        XLSX.writeFile(workbook, "plantilla_importacion_antineo.xlsx");
    };

    return (
        <div className="bulk-import-container">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
            />
            <div className="btn-group">
                <button
                    className="btn btn-secondary bulk-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : '📊 Carga Masiva'}
                </button>
                <button className="template-link" onClick={downloadTemplate}>
                    Descargar Plantilla
                </button>
            </div>

            <style jsx>{`
                .bulk-import-container { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
                .btn-group { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .bulk-btn {
                    background: #f8fafc;
                    border: 2px solid #e2e8f0;
                    color: #475569;
                    font-weight: 700;
                    padding: 0.6rem 1.2rem;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                    cursor: pointer;
                }
                .bulk-btn:hover:not(:disabled) {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #0f172a;
                    transform: translateY(-1px);
                }
                .bulk-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .template-link {
                    background: none;
                    border: none;
                    color: #0ea5e9;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-decoration: underline;
                    cursor: pointer;
                    padding: 0;
                }
                .template-link:hover {
                    color: #0284c7;
                }
            `}</style>
        </div>
    );
}
