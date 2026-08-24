'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CupsSearch from '@/components/ui/CupsSearch';

interface ServiceItemManagerProps {
    serviceOrderId: string;
    initialItems?: any[];
    contractId?: string;
}

export default function ServiceItemManager({ serviceOrderId, initialItems = [], contractId }: ServiceItemManagerProps) {
    const router = useRouter();
    const [items, setItems] = useState<any[]>(initialItems);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    const [newItem, setNewItem] = useState({
        cupsCode: '',
        cupsDescription: '',
        quantity: 1,
        unitValue: 0
    });

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/admissions/items', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    serviceOrderId
                })
            });

            if (!res.ok) throw new Error('Error al agregar servicio');

            const savedItem = await res.json();
            setItems([...items, savedItem]);
            setShowForm(false);
            setNewItem({
                cupsCode: '',
                cupsDescription: '',
                quantity: 1,
                unitValue: 0
            });
            router.refresh();
        } catch (error: any) {
            alert('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectCup = async (cup: any) => {
        let price = 0;

        // Auto-price if contract is present
        if (serviceOrderId && typeof initialItems === 'object' && 'contractId' in (window as any)) {
            // Note: contractId is passed as prop, but I need to make sure I have access to it.
            // I should double check if I added it to props in this file's signature. I did not yet in this file content view, only in the caller.
        }

        if (contractId) {
            try {
                const res = await fetch(`/api/contracts/price?contractId=${contractId}&cups=${cup.code}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.value) {
                        price = data.value;
                        console.log('Precio Automático:', data.source);
                    }
                }
            } catch (e) {
                console.error('Error fetching price', e);
            }
        }

        setNewItem(prev => ({
            ...prev,
            cupsCode: cup.code,
            cupsDescription: cup.description,
            unitValue: price
        }));
    };

    return (
        <section className="glass-panel">
            <div className="section-header-check">
                <div className="section-title">
                    <span className="icon">💉</span>
                    <h3>Servicios / Procedimientos (CUPS)</h3>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-sm-primary"
                    >
                        + Agregar Servicio
                    </button>
                )}
            </div>

            {showForm && (
                <div className="payment-form fade-in box-highlight">
                    <h4 className="mb-4 font-bold text-slate-600">Nuevo Servicio</h4>
                    <form onSubmit={handleAddItem}>
                        <div className="grid-1 mb-4">
                            <label className="block text-sm font-semibold mb-1">Buscar Procedimiento (CUPS)</label>
                            <CupsSearch onSelect={handleSelectCup} />
                        </div>

                        <div className="grid-3">
                            <div className="form-group">
                                <label>Código</label>
                                <input
                                    readOnly
                                    value={newItem.cupsCode}
                                    className="bg-slate-100"
                                />
                            </div>
                            <div className="form-group">
                                <label>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={newItem.quantity}
                                    onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Valor Unitario</label>
                                <input
                                    type="number"
                                    value={newItem.unitValue}
                                    onChange={e => setNewItem({ ...newItem, unitValue: parseFloat(e.target.value) || 0 })}
                                    className="money-input"
                                />
                            </div>
                        </div>

                        <div className="form-group mt-2">
                            <label>Descripción</label>
                            <input
                                readOnly
                                value={newItem.cupsDescription}
                                className="bg-slate-100"
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
                            <button type="submit" className="btn-submit-sm" disabled={loading || !newItem.cupsCode}>
                                {loading ? 'Guardando...' : 'Guardar Servicio'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="table-container mt-6">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Descripción</th>
                            <th>Cant.</th>
                            <th>Valor Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={5} className="text-center p-4 text-slate-400">No hay servicios registrados</td></tr>
                        ) : (
                            items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="font-mono">{item.cupsCode}</td>
                                    <td>{item.cupsDescription}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td>$ {item.unitValue.toLocaleString()}</td>
                                    <td className="font-bold text-blue-600">$ {item.totalValue.toLocaleString()}</td>
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
                .section-header-check { display: flex; justify-content: space-between; align-items: center; }
                .section-title { display: flex; align-items: center; gap: 0.75rem; }
                .section-title h3 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
                .icon { font-size: 1.5rem; }
                .btn-sm-primary {
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .btn-sm-primary:hover { background: #2563eb; }
                .box-highlight {
                    background: #eff6ff;
                    border: 1px dashed #3b82f6;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-top: 1rem;
                }
                .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
                .grid-1 { display: grid; grid-template-columns: 1fr; }
                .mt-4 { margin-top: 1rem; } .mt-6 { margin-top: 1.5rem; } .mb-4 { margin-bottom: 1rem; }
                .flex { display: flex; } .justify-end { justify-content: flex-end; } .gap-2 { gap: 0.5rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label { font-weight: 600; font-size: 0.85rem; color: #475569; }
                input { padding: 0.6rem; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.95rem; }
                .money-input { font-weight: 700; color: #3b82f6; }
                .btn-secondary { background: transparent; border: 1px solid #cbd5e1; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
                .btn-submit-sm { background: #2563eb; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
                .btn-submit-sm:disabled { opacity: 0.5; cursor: not-allowed; }
                .table-container { overflow-x: auto; }
                .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                .data-table th { text-align: left; padding: 0.75rem; background: #f8fafc; color: #64748b; font-weight: 600; }
                .data-table td { padding: 0.75rem; border-bottom: 1px solid #f1f5f9; color: #334155; }
                .font-mono { font-family: monospace; }
            `}</style>
        </section>
    );
}
