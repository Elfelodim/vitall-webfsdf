'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ReceiptManagerProps {
    serviceOrderId: string;
    patientDocument: string;
    initialReceipts: any[];
}

export default function ReceiptManager({ serviceOrderId, patientDocument, initialReceipts }: ReceiptManagerProps) {
    const router = useRouter();
    const [receipts, setReceipts] = useState(initialReceipts);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [payment, setPayment] = useState({
        amount: 0,
        concept: 'Copago',
        paymentMethod: 'Cash',
        prefix: 'RC',
        notes: ''
    });

    const handleCreateReceipt = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admissions/receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...payment,
                    patientDocument,
                    serviceOrderId
                })
            });

            if (!res.ok) throw new Error('Error al crear recibo');

            const newReceipt = await res.json();
            setReceipts([newReceipt, ...receipts]);
            setShowForm(false);
            setPayment({
                amount: 0,
                concept: 'Copago',
                paymentMethod: 'Cash',
                prefix: 'RC',
                notes: ''
            });
            router.refresh(); // Refresh server data if needed
            alert('✅ Recibo generado exitosamente');
        } catch (error: any) {
            alert('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="glass-panel">
            <div className="section-header-check">
                <div className="section-title">
                    <span className="icon">💰</span>
                    <h3>Recibos de Caja / Pagos</h3>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-sm-primary"
                    >
                        + Nuevo Recibo
                    </button>
                )}
            </div>

            {showForm && (
                <div className="payment-form fade-in box-highlight">
                    <h4 className="mb-4 font-bold text-slate-600">Nuevo Recibo de Caja</h4>
                    <form onSubmit={handleCreateReceipt}>
                        <div className="grid-3">
                            <div className="form-group">
                                <label>Prefijo</label>
                                <input
                                    value={payment.prefix}
                                    onChange={e => setPayment({ ...payment, prefix: e.target.value.toUpperCase() })}
                                    className="font-mono"
                                />
                            </div>
                            <div className="form-group">
                                <label>Concepto</label>
                                <select value={payment.concept} onChange={e => setPayment({ ...payment, concept: e.target.value })}>
                                    <option value="Copago">Copago</option>
                                    <option value="Cuota Moderadora">Cuota Moderadora</option>
                                    <option value="Particular">Servicio Particular</option>
                                    <option value="Abono">Abono</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Valor</label>
                                <input
                                    type="number"
                                    value={payment.amount || ''}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setPayment({ ...payment, amount: val ? parseFloat(val) : 0 });
                                    }}
                                    className="money-input"
                                />
                            </div>
                        </div>
                        <div className="grid-2 mt-4">
                            <div className="form-group">
                                <label>Medio de Pago</label>
                                <select value={payment.paymentMethod} onChange={e => setPayment({ ...payment, paymentMethod: e.target.value })}>
                                    <option value="Cash">Efectivo</option>
                                    <option value="Card">Tarjeta Crédito/Débito</option>
                                    <option value="Transfer">Transferencia</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Notas</label>
                                <input value={payment.notes} onChange={e => setPayment({ ...payment, notes: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                            <button type="submit" className="btn-submit-sm" disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar Recibo'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container mt-6">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Recibo #</th>
                            <th>Fecha</th>
                            <th>Concepto</th>
                            <th>Medio</th>
                            <th>Valor</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receipts.length === 0 ? (
                            <tr><td colSpan={6} className="text-center p-4 text-slate-400">No hay recibos registrados</td></tr>
                        ) : (
                            receipts.map((r: any) => (
                                <tr key={r.id}>
                                    <td className="font-mono font-bold">{r.receiptNumber}</td>
                                    <td>{new Date(r.date).toLocaleString()}</td>
                                    <td>{r.concept}</td>
                                    <td>{r.paymentMethod}</td>
                                    <td className="font-bold text-emerald-600">$ {r.amount.toLocaleString()}</td>
                                    <td>
                                        <button className="btn-xs">Imprimir</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid white;
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .section-header-check {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .section-title h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .icon { font-size: 1.5rem; }
                .btn-sm-primary {
                    background: #10b981;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-sm-primary:hover { background: #059669; }

                .box-highlight {
                    background: #f0fdf4;
                    border: 1px dashed #10b981;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-top: 1rem;
                }
                .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .mt-4 { margin-top: 1rem; }
                .mt-6 { margin-top: 1.5rem; }
                .mb-4 { margin-bottom: 1rem; }
                .flex { display: flex; }
                .justify-end { justify-content: flex-end; }
                .gap-2 { gap: 0.5rem; }

                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-weight: 600; font-size: 0.85rem; color: #475569; }
                input, select {
                    padding: 0.6rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    font-size: 0.95rem;
                }
                .money-input { font-weight: 700; color: #10b981; }
                .btn-secondary {
                    background: transparent;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 1rem;
                    border-radius: 6px;
                    cursor: pointer;
                }
                .btn-submit-sm {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.5rem 1.5rem;
                    border-radius: 6px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .table-container { overflow-x: auto; }
                .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                .data-table th { text-align: left; padding: 0.75rem; background: #f8fafc; color: #64748b; font-weight: 600; }
                .data-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
                .font-mono { font-family: monospace; }
                .btn-xs { padding: 0.2rem 0.5rem; font-size: 0.75rem; border: 1px solid #e2e8f0; border-radius: 4px; background: white; cursor: pointer; }
            `}</style>
        </section>
    );
}
