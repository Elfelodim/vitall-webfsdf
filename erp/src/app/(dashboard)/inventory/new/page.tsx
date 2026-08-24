'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        code: '',
        name: '',
        type: 'Medicine',
        category: '',
        unit: 'Unit',
        price: 0,
        minStock: 5,
        status: 'Active',
        initialBatch: {
            batchNumber: '',
            expirationDate: '',
            quantity: 0
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/inventory', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    currentStock: form.initialBatch.quantity // Sync currentStock with initial batch
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al registrar producto');
            }

            router.push('/inventory');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-product-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Nuevo Producto</h1>
                    <p className="page-subtitle">Registro de suministros, medicamentos y dispositivos médicos.</p>
                </div>
                <button onClick={() => router.back()} className="back-btn">Regresar</button>
            </header>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-sections">
                    {/* Sección 1: Información General */}
                    <div className="form-section glass-panel">
                        <h2 className="section-title">Información General</h2>
                        <div className="grid-2">
                            <div className="field">
                                <label>Código (CUM / Interno)</label>
                                <input required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} placeholder="Ej: MED-001" />
                            </div>
                            <div className="field">
                                <label>Nombre del Producto</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ej: Acetaminofén 500mg" />
                            </div>
                        </div>
                        <div className="grid-2">
                            <div className="field">
                                <label>Categoría</label>
                                <input required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Ej: Analgésicos" />
                            </div>
                            <div className="field">
                                <label>Tipo de Producto</label>
                                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                    <option value="Medicine">Medicamento</option>
                                    <option value="MedicalDevice">Dispositivo Médico</option>
                                    <option value="Supply">Suministro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Sección 2: Precios y Stock Mínimo */}
                    <div className="form-section glass-panel">
                        <h2 className="section-title">Precios y Alertas</h2>
                        <div className="grid-2">
                            <div className="field">
                                <label>Precio Unitario</label>
                                <div className="input-with-icon">
                                    <span className="currency">$</span>
                                    <input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="field">
                                <label>Unidad de Medida</label>
                                <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
                                    <option value="Tablet">Tableta</option>
                                    <option value="Box">Caja</option>
                                    <option value="Bottle">Frasco</option>
                                    <option value="Unit">Unidad</option>
                                    <option value="Ampoule">Ampolla</option>
                                </select>
                            </div>
                        </div>
                        <div className="field">
                            <label>Stock Mínimo (Alerta)</label>
                            <input type="number" required value={form.minStock} onChange={e => setForm({ ...form, minStock: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>

                    {/* Sección 3: Lote Inicial */}
                    <div className="form-section glass-panel highlight">
                        <h2 className="section-title">Primer Lote e Inventario Inicial</h2>
                        <div className="grid-2">
                            <div className="field">
                                <label>Número de Lote</label>
                                <input required value={form.initialBatch.batchNumber} onChange={e => setForm({ ...form, initialBatch: { ...form.initialBatch, batchNumber: e.target.value } })} placeholder="Ej: LOT-2024-01" />
                            </div>
                            <div className="field">
                                <label>Fecha de Vencimiento</label>
                                <input type="date" required value={form.initialBatch.expirationDate} onChange={e => setForm({ ...form, initialBatch: { ...form.initialBatch, expirationDate: e.target.value } })} />
                            </div>
                        </div>
                        <div className="field">
                            <label>Cantidad Inicial</label>
                            <input type="number" required value={form.initialBatch.quantity} onChange={e => setForm({ ...form, initialBatch: { ...form.initialBatch, quantity: parseInt(e.target.value) || 0 } })} />
                        </div>
                    </div>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" disabled={loading} className="save-btn">
                        {loading ? 'Registrando...' : 'Registrar Producto e Inventario'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .new-product-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
                .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
                .page-title { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -0.025em; }
                .page-subtitle { color: #64748b; font-size: 1rem; }
                
                .product-form { display: flex; flex-direction: column; gap: 2rem; }
                .form-sections { display: flex; flex-direction: column; gap: 1.5rem; }
                .form-section { padding: 2rem; border-radius: 20px; background: white; border: 1px solid #e2e8f0; }
                .highlight { border: 2px solid #0ea5e9; background: #f0f9ff; }
                .section-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.75rem; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
                .field { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-size: 0.75rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
                
                input, select {
                    padding: 0.8rem 1rem;
                    border: 2px solid #f1f5f9;
                    border-radius: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    background: #f8fafc;
                    transition: all 0.2s;
                }
                input:focus, select:focus { border-color: #0ea5e9; background: white; outline: none; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
                
                .input-with-icon { position: relative; display: flex; align-items: center; }
                .currency { position: absolute; left: 1rem; color: #94a3b8; font-weight: 800; }
                .input-with-icon input { padding-left: 2rem; width: 100%; }
                
                .error-msg { background: #fee2e2; color: #ef4444; padding: 1rem; border-radius: 12px; font-weight: 700; text-align: center; }
                
                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .save-btn { background: #0ea5e9; color: white; border: none; padding: 1rem 2.5rem; border-radius: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 15px rgba(14, 165, 233, 0.2); transition: all 0.2s; }
                .save-btn:hover { transform: translateY(-2px); box-shadow: 0 15px 20px rgba(14, 165, 233, 0.3); }
                .save-btn:disabled { background: #94a3b8; cursor: not-allowed; transform: none; box-shadow: none; }
                
                .cancel-btn { background: #f1f5f9; border: none; padding: 1rem 2rem; border-radius: 14px; font-weight: 700; color: #64748b; cursor: pointer; transition: all 0.2s; }
                .back-btn { background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 700; color: #64748b; cursor: pointer; }
                
                .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.4); }
            `}</style>
        </div>
    );
}
