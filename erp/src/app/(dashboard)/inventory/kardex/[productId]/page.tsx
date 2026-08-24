'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function KardexPage() {
    const { productId } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newMovement, setNewMovement] = useState({
        type: 'In',
        quantity: 0,
        unitPrice: 0,
        reason: '',
        reference: ''
    });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [productId]);

    const fetchData = async () => {
        try {
            const [pRes, mRes] = await Promise.all([
                fetch(`/api/inventory/products/${productId}`),
                fetch(`/api/inventory/movements/${productId}`)
            ]);

            if (!pRes.ok || !mRes.ok) {
                const pErr = !pRes.ok ? await pRes.json() : null;
                throw new Error(pErr?.message || 'Error al cargar datos del Kardex');
            }

            setProduct(await pRes.json());
            setMovements(await mRes.json());
        } catch (err: any) {
            console.error('Error fetching kardex data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterMovement = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/inventory/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    ...newMovement
                })
            });

            if (res.ok) {
                setShowModal(false);
                setNewMovement({
                    type: 'In',
                    quantity: 0,
                    unitPrice: product?.lastUnitValue || 0, // Default to last known price
                    reason: '',
                    reference: ''
                });
                fetchData();
                router.refresh();
            }
        } catch (err) {
            alert('Error al registrar movimiento');
        }
    };

    const exportToExcel = () => {
        const dataToExport = movementsWithBalance.map(m => ({
            Fecha: new Date(m.date).toLocaleString(),
            Tipo: m.type === 'In' ? 'ENTRADA' : m.type === 'Out' ? 'SALIDA' : 'AJUSTE',
            Referencia: m.reference || '',
            Motivo: m.reason,
            "Vr. Unitario": m.unitPrice || 0,
            Ingreso: m.type === 'In' ? m.quantity : 0,
            Egreso: m.type === 'Out' ? m.quantity : 0,
            "Vr. Total": m.totalValue || 0,
            Saldo: m.balance
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Kardex");
        XLSX.writeFile(wb, `kardex_${product?.code || 'producto'}.xlsx`);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(18);
        doc.text(`Kardex de Inventario: ${product?.name}`, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Código: ${product?.code} | Stock Actual: ${product?.currentStock} ${product?.unit}`, 14, 30);
        doc.text(`Fecha de Reporte: ${new Date().toLocaleString()}`, 14, 36);

        // Table
        const tableData = movementsWithBalance.map(m => [
            new Date(m.date).toLocaleString(),
            m.type === 'In' ? 'ENTRADA' : m.type === 'Out' ? 'SALIDA' : 'AJUSTE',
            m.reference || '-',
            m.reason,
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.unitPrice || 0),
            m.type === 'In' ? `+${m.quantity}` : '',
            m.type === 'Out' ? `-${m.quantity}` : '',
            new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.totalValue || 0),
            m.balance
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Fecha', 'Tipo', 'Referencia', 'Motivo', 'Vr. Unit', 'Entrada', 'Salida', 'Vr. Total', 'Saldo']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [0, 122, 204] },
            columnStyles: {
                0: { cellWidth: 35 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                4: { halign: 'right' },
                5: { halign: 'right' },
                6: { halign: 'right' },
                7: { halign: 'right' },
                8: { halign: 'right', fontStyle: 'bold' }
            }
        });

        doc.save(`kardex_${product?.code || 'producto'}.pdf`);
    };

    if (loading) return <div className="loading">Cargando Kardex...</div>;

    if (error) return (
        <div className="error-container glass-panel">
            <h2>⚠️ Error al Cargar</h2>
            <p>{error}</p>
            <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
                Esto suele ocurrir si el servidor necesita reiniciarse para aplicar cambios en la base de datos.
            </p>
            <button onClick={() => fetchData()} className="btn-save">Reintentar</button>
            <style jsx>{`
                .error-container { margin: 4rem auto; max-width: 500px; padding: 2rem; text-align: center; }
                h2 { color: #ef4444; margin-bottom: 1rem; }
            `}</style>
        </div>
    );
    let runningBalance = 0;
    const movementsWithBalance = [...movements].reverse().map(m => {
        const change = m.type === 'Out' ? -Math.abs(m.quantity) : m.quantity;
        runningBalance += change;
        return { ...m, balance: runningBalance };
    }).reverse();

    return (
        <div className="kardex-container">
            <header className="page-header">
                <div className="header-info">
                    <button onClick={() => router.back()} className="back-btn">←</button>
                    <div>
                        <h1 className="page-title">Kardex: {product?.name}</h1>
                        <p className="page-subtitle">Historial detallado de movimientos y balance de stock.</p>
                    </div>
                </div>
                <div className="header-actions">
                    <div className="export-tools">
                        <button onClick={exportToExcel} className="btn-tool excel">📊 Excel</button>
                        <button onClick={downloadPDF} className="btn-tool pdf">📄 PDF</button>
                    </div>
                    <div className="header-stats-grid glass-panel">
                        <div className="stat">
                            <span className="label">Código</span>
                            <span className="value-sm">{product?.code}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Nombre</span>
                            <span className="value-sm">{product?.name}</span>
                        </div>
                        <div className="stat highlight">
                            <span className="label">Stock Actual</span>
                            <span className={`value-main ${product?.currentStock <= product?.minStock ? 'low' : ''}`}>
                                {product?.currentStock} <small>{product?.unit}</small>
                            </span>
                        </div>
                        <div className="stat">
                            <span className="label">Último Vr. Unitario</span>
                            <span className="value-sm">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product?.lastUnitValue || 0)}</span>
                        </div>
                        <div className="stat">
                            <span className="label">Vr. Promedio Año</span>
                            <span className="value-sm">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product?.avgValueLastYear || 0)}</span>
                        </div>
                        <button onClick={() => setShowModal(true)} className="btn-add">Registrar Movimiento</button>
                    </div>
                </div>
            </header>

            <div className="movements-table-container glass-panel">
                <table className="movements-table">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Referencia</th>
                            <th>Motivo / Observación</th>
                            <th>Vr. Unitario</th>
                            <th>Ingreso</th>
                            <th>Egreso</th>
                            <th>Vr. Total</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {movementsWithBalance.map((m: any) => (
                            <tr key={m.id}>
                                <td>{new Date(m.date).toLocaleString()}</td>
                                <td>
                                    <span className={`type-badge ${m.type.toLowerCase()}`}>
                                        {m.type === 'In' ? 'ENTRADA' : m.type === 'Out' ? 'SALIDA' : 'AJUSTE'}
                                    </span>
                                </td>
                                <td className="ref-cell">{m.reference || '-'}</td>
                                <td className="reason-cell">{m.reason}</td>
                                <td className="val-cell">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.unitPrice || 0)}</td>
                                <td className="in-cell">{m.type === 'In' ? `+${m.quantity}` : '-'}</td>
                                <td className="out-cell">{m.type === 'Out' ? `-${m.quantity}` : '-'}</td>
                                <td className="val-total-cell">{new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(m.totalValue || 0)}</td>
                                <td className="balance-cell">{m.balance}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-panel">
                        <h2>Registrar Nuevo Movimiento</h2>
                        <form onSubmit={handleRegisterMovement}>
                            <div className="field">
                                <label>Tipo de Movimiento</label>
                                <select
                                    value={newMovement.type}
                                    onChange={e => setNewMovement({ ...newMovement, type: e.target.value })}
                                >
                                    <option value="In">Entrada (Compra/Donación)</option>
                                    <option value="Out">Salida (Consumo/Vencimiento)</option>
                                    <option value="Adjustment">Ajuste Manual</option>
                                </select>
                            </div>
                            <div className="grid-3">
                                <div className="field">
                                    <label>Cantidad</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={newMovement.quantity}
                                        onChange={e => setNewMovement({ ...newMovement, quantity: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="field">
                                    <label>Valor Unitario</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={newMovement.unitPrice}
                                        onChange={e => setNewMovement({ ...newMovement, unitPrice: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="field">
                                    <label>Referencia (Opcional)</label>
                                    <input
                                        placeholder="No. Factura / Remisión"
                                        value={newMovement.reference}
                                        onChange={e => setNewMovement({ ...newMovement, reference: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label>Motivo / Observación</label>
                                <textarea
                                    required
                                    placeholder="Ej: Ingreso por compra mensual..."
                                    value={newMovement.reason}
                                    onChange={e => setNewMovement({ ...newMovement, reason: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">Cancelar</button>
                                <button type="submit" className="btn-save">Confirmar Registro</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .kardex-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
                .header-info { display: flex; gap: 1.5rem; align-items: center; }
                .back-btn { background: white; border: 1px solid #e2e8f0; border-radius: 10px; width: 40px; height: 40px; font-size: 1.2rem; cursor: pointer; transition: all 0.2s; }
                .back-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
                .page-title { font-size: 1.75rem; font-weight: 800; color: #0f172a; margin: 0; }
                .page-subtitle { color: #64748b; margin: 0; font-size: 0.95rem; }
                
                .header-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
                .export-tools { display: flex; gap: 0.5rem; }
                .btn-tool { background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.8rem; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s; }
                .btn-tool:hover { background: #f8fafc; border-color: #cbd5e1; transform: translateY(-1px); }
                .btn-tool.excel { color: #166534; }
                .btn-tool.pdf { color: #991b1b; }

                .header-stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); 
                    gap: 1.5rem; 
                    padding: 1.25rem 2rem; 
                    border-radius: 18px; 
                    align-items: center;
                    width: 100%;
                    max-width: 900px;
                }
                .stat { display: flex; flex-direction: column; gap: 2px; }
                .stat.highlight { border-left: 2px solid #e2e8f0; padding-left: 1.5rem; }
                .stat .label { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat .value-sm { font-size: 1rem; font-weight: 700; color: #1e293b; }
                .stat .value-main { font-size: 1.5rem; font-weight: 800; color: #0ea5e9; line-height: 1; }
                .stat .value-main small { font-size: 0.8rem; font-weight: 600; opacity: 0.7; }
                .stat .value-main.low { color: #ef4444; }
                
                .btn-add { background: #0ea5e9; color: white; border: none; padding: 0.8rem 1.2rem; border-radius: 12px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 6px rgba(14, 165, 233, 0.2); transition: all 0.2s; white-space: nowrap; }
                .btn-add:hover { transform: translateY(-1px); box-shadow: 0 6px 12px rgba(14, 165, 233, 0.3); }

                .glass-panel { background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                
                .movements-table-container { overflow: hidden; }
                .movements-table { width: 100%; border-collapse: collapse; text-align: left; }
                .movements-table th { padding: 1.25rem 1rem; background: #f8fafc; color: #64748b; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
                .movements-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; color: #334155; }
                
                .type-badge { font-size: 0.7rem; font-weight: 800; padding: 0.3rem 0.6rem; border-radius: 6px; }
                .type-badge.in { background: #dcfce7; color: #166534; }
                .type-badge.out { background: #fee2e2; color: #991b1b; }
                .type-badge.adjustment { background: #fef9c3; color: #854d0e; }
                
                .in-cell { color: #16a34a; font-weight: 700; text-align: right; }
                .out-cell { color: #dc2626; font-weight: 700; text-align: right; }
                .val-cell, .val-total-cell { font-size: 0.85rem; color: #64748b; text-align: right; }
                .val-total-cell { font-weight: 700; color: #1e293b; }
                .balance-cell { font-weight: 800; color: #0f172a; text-align: right; }
                
                .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { width: 100%; max-width: 500px; padding: 2rem; position: relative; }
                .modal-content h2 { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
                
                .field { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
                .field label { font-size: 0.75rem; font-weight: 700; color: #64748b; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
                input, select, textarea { padding: 0.75rem 1rem; border: 2px solid #f1f5f9; border-radius: 12px; font-size: 1rem; font-weight: 600; background: #f8fafc; transition: all 0.2s; }
                input:focus, select:focus, textarea:focus { border-color: #0ea5e9; outline: none; background: white; }
                textarea { resize: vertical; min-height: 80px; }
                
                .modal-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .btn-cancel { background: #f1f5f9; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; color: #64748b; cursor: pointer; }
                .btn-save { background: #0ea5e9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 10px; font-weight: 700; cursor: pointer; }
                
                .loading { display: flex; align-items: center; justify-content: center; height: 300px; font-weight: 800; color: #64748b; }
            `}</style>
        </div>
    );
}
