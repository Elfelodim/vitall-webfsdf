'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function NewEvolutionPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const patientId = (params.params as any)?.patientId || params.patientId as string;
    const prefilledHospId = searchParams.get('hospId') || '';

    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [error, setError] = useState('');
    const [history, setHistory] = useState<any>(null);
    const [mipresResult, setMipresResult] = useState<any>(null);

    // Dispensing State
    const [dispenseData, setDispenseData] = useState({ productId: '', quantity: 1, notes: '' });
    const [dispenseStatus, setDispenseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Inventory State
    const [inventoryProducts, setInventoryProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch('/api/inventory');
                if (res.ok) {
                    const data = await res.json();
                    setInventoryProducts(data);
                }
            } catch (err) {
                console.error('Error loading inventory:', err);
            }
        };
        fetchProducts();
    }, []);

    // Initial range: Last 24 hours
    const [startDate, setStartDate] = useState(() => {
        const date = new Date();
        date.setHours(date.getHours() - 24);
        return date.toISOString().slice(0, 16);
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 16));

    const [form, setForm] = useState({
        hospitalizationId: prefilledHospId,
        note: '',
        doctorName: 'Dr. Alejandro Gomez',
        bloodPressure: '',
        heartRate: '',
        temperature: ''
    });

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/clinical/records/${patientId}`);
                const data = await response.json();
                setHistory(data);
            } catch (err) {
                console.error('Error fetching history:', err);
            } finally {
                setHistoryLoading(false);
            }
        };

        if (patientId) fetchHistory();
    }, [patientId]);

    const filteredResults = useMemo(() => {
        if (!history) return { labs: [], images: [], scans: [] };

        const start = new Date(startDate);
        const end = new Date(endDate);

        const filterDate = (dateStr: string) => {
            const date = new Date(dateStr);
            return date >= start && date <= end;
        };

        return {
            labs: (history.labResults || []).filter((lab: any) => filterDate(lab.performedAt)),
            images: (history.diagnosticImages || []).filter((img: any) => filterDate(img.performedAt)),
            scans: (history.machineScans || []).filter((scan: any) => filterDate(scan.performedAt))
        };
    }, [history, startDate, endDate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const generateMipresPrescription = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/mipres/prescribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    FPrescripcion: new Date().toISOString().split('T')[0],
                    TipoIDPaciente: 'CC',
                    NroIDPaciente: patientId,
                    CodAmbitoAtencion: '1',
                    Medicamentos: [{
                        CodTecnologia: '123456-MAT',
                        NombreTecnologia: 'Pembrolizumab',
                        Concentracion: '100mg',
                        Dosis: 200,
                        Duracion: 21,
                        CantidadTotal: 2,
                        Indicaciones: 'Administrar cada 3 semanas'
                    }]
                })
            });
            if (!res.ok) throw new Error('Error MIPRES');
            const data = await res.json();
            alert(`✅ Prescripción Exitosa!\nNo. Prescripción: ${data.NoPrescripcion}\nID Transacción: ${data.IdTransaccion}`);
            setMipresResult(data);
        } catch (error: any) {
            console.error(error);
            alert('❌ Error al generar MIPRES: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Dispensing Logic
    const handleDispense = async () => {
        if (!dispenseData.productId || dispenseData.quantity <= 0) {
            alert('Seleccione un producto y cantidad válida');
            return;
        }

        setDispenseStatus('loading');
        try {
            const response = await fetch('/api/inventory/dispense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: dispenseData.productId,
                    quantity: dispenseData.quantity,
                    patientDocument: patientId || 'N/A', // Using patientId as documentNumber from URL
                    clinicalRecordId: form.hospitalizationId || patientId,
                    notes: dispenseData.notes
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            setDispenseStatus('success');
            alert(`Suministro registrado. Stock restante: ${result.newStock}`);
            setDispenseData({ productId: '', quantity: 1, notes: '' });

            // Refresh inventory locally
            setInventoryProducts(prev => prev.map(p =>
                p.id === dispenseData.productId ? { ...p, currentStock: result.newStock } : p
            ));
        } catch (error: any) {
            console.error(error);
            setDispenseStatus('error');
            alert('Error al registrar suministro: ' + error.message);
        } finally {
            setDispenseStatus('idle');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/clinical/records/${patientId}/hospitalization/evolution`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientDocument: patientId }),
            });

            if (!response.ok) throw new Error('Error al registrar la evolución');

            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="evolution-layout">
            <div className="main-evolution">
                <header className="form-header">
                    <h1>Nueva Evolución Médica</h1>
                </header>

                <PatientHeader patientId={patientId} />

                <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                    <div className="field-group">
                        <label>ID de Hospitalización *</label>
                        <input
                            name="hospitalizationId"
                            value={form.hospitalizationId}
                            onChange={handleChange}
                            required
                            placeholder="UUID de la estancia activa"
                        />
                    </div>

                    <div className="grid-vitals">
                        <div className="field-group">
                            <label>Tensión Arterial</label>
                            <input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} placeholder="120/80" />
                        </div>
                        <div className="field-group">
                            <label>FC (lpm)</label>
                            <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="72" />
                        </div>
                        <div className="field-group">
                            <label>Temp (°C)</label>
                            <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="36.5" />
                        </div>
                    </div>

                    <div className="field-group">
                        <label>Nota de Evolución *</label>
                        <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            required
                            rows={8}
                            placeholder="Descripción detallada de la evolución clínica..."
                        />
                    </div>

                    <div className="mipres-section">
                        <div className="section-title">
                            <h3>💊 Prescripción No PBS (MIPRES)</h3>
                            <span className="beta-badge">BETA</span>
                        </div>

                        <div className="mipres-form">
                            <div className="field-group">
                                <label>Tecnología (CUM/CUPS) - Búsqueda Mock</label>
                                <select className="tech-select">
                                    <option value="">Seleccione Tecnología No PBS...</option>
                                    <option value="123456-MAT">Pembrolizumab (Keytruda) 100mg</option>
                                    <option value="789012-PRO">PET CT Dedicado</option>
                                </select>
                            </div>

                            <button
                                type="button"
                                className="mipres-btn"
                                onClick={generateMipresPrescription}
                            >
                                ⚡ Generar Prescripción MIPRES
                            </button>
                        </div>
                    </div>

                    {error && <div className="error-message">{error}</div>}


                    <div className="mipres-section" style={{ background: '#ecfdf5', borderColor: '#34d399' }}>
                        <div className="section-title">
                            <h3>💊 Suministro de Medicamentos (Descarga de Inventario)</h3>
                        </div>
                        <div className="mipres-form">
                            <div className="field-group" style={{ flex: 2 }}>
                                <label>Producto / Medicamento</label>
                                <select
                                    className="tech-select"
                                    value={dispenseData.productId}
                                    onChange={(e) => setDispenseData({ ...dispenseData, productId: e.target.value })}
                                    style={{ borderColor: '#34d399' }}
                                >
                                    <option value="">Seleccione producto...</option>
                                    {inventoryProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Stock: {p.currentStock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-group" style={{ flex: 1 }}>
                                <label>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={dispenseData.quantity}
                                    onChange={(e) => setDispenseData({ ...dispenseData, quantity: parseInt(e.target.value) || 1 })}
                                    style={{ borderColor: '#34d399', width: '100%' }}
                                />
                            </div>
                            <div className="field-group" style={{ flex: 2 }}>
                                <label>Notas / Dosis</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1 tableta cada 8 horas..."
                                    value={dispenseData.notes}
                                    onChange={(e) => setDispenseData({ ...dispenseData, notes: e.target.value })}
                                    style={{ borderColor: '#34d399', width: '100%' }}
                                />
                            </div>
                            <button
                                type="button"
                                className="mipres-btn"
                                onClick={handleDispense}
                                disabled={dispenseStatus === 'loading'}
                                style={{ background: '#059669', height: '50px' }}
                            >
                                {dispenseStatus === 'loading' ? 'Registrando...' : 'Registrar Suministro'}
                            </button>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Evolución'}
                        </button>
                    </div>
                </form>
            </div>

            <aside className="diagnostic-sidebar">
                <div className="sidebar-header">
                    <h3>Resultados de Apoyo</h3>
                    <div className="filter-controls">
                        <div className="date-field">
                            <label>Desde:</label>
                            <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="date-field">
                            <label>Hasta:</label>
                            <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="results-container">
                    {historyLoading ? (
                        <div className="sidebar-loader">Cargando resultados...</div>
                    ) : (
                        <>
                            <section className="result-section">
                                <h4>Laboratorios</h4>
                                {filteredResults.labs.length > 0 ? (
                                    filteredResults.labs.map((lab: any) => (
                                        <div key={lab.id} className="mini-card">
                                            <div className="card-top">
                                                <strong>{lab.testName}</strong>
                                                <span>{new Date(lab.performedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="value">{lab.value} {lab.unit}</p>
                                        </div>
                                    ))
                                ) : <p className="no-res">No hay laboratorios en este rango.</p>}
                            </section>

                            <section className="result-section">
                                <h4>Imágenes y RX</h4>
                                {[...filteredResults.images, ...filteredResults.scans].length > 0 ? (
                                    [...filteredResults.images, ...filteredResults.scans].map((res: any) => (
                                        <div key={res.id} className="mini-card">
                                            <div className="card-top">
                                                <strong>{res.type || res.studyType}</strong>
                                                <span>{new Date(res.performedAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="description">{res.keyFindings || res.interpretation}</p>
                                        </div>
                                    ))
                                ) : <p className="no-res">No hay imágenes en este rango.</p>}
                            </section>
                        </>
                    )}
                </div>
            </aside>

            <style jsx>{`
                .evolution-layout {
                    display: flex;
                    gap: 2rem;
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .main-evolution {
                    flex: 1;
                    min-width: 0;
                }

                .form-header { margin-bottom: 2rem; }
                .form-header h1 { color: #005f99; margin-bottom: 0.25rem; }
                .form-header p { color: #636e72; font-size: 0.9rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .grid-vitals {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .field-group {
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label { font-weight: 600; font-size: 0.9rem; color: #444; }

                input, textarea {
                    padding: 0.875rem 1rem;
                    border: 2px solid #dfe6e9;
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                    width: 100%;
                    box-sizing: border-box;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                }

                .diagnostic-sidebar {
                    width: 380px;
                    background: #f8fafc;
                    border-radius: 24px;
                    border: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 120px);
                    position: sticky;
                    top: 100px;
                }

                .sidebar-header {
                    padding: 1.5rem;
                    border-bottom: 1px solid #e2e8f0;
                }

                .sidebar-header h3 { margin-bottom: 1rem; color: #007acc; }

                .filter-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }

                .date-field {
                    display: flex;
                    flex-direction: column;
                    gap: 0.25rem;
                }

                .date-field label { font-size: 0.75rem; color: #636e72; }
                .date-field input { padding: 0.5rem; font-size: 0.8rem; }

                .results-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 1.5rem;
                }

                .result-section { margin-bottom: 2rem; }
                .result-section h4 { 
                    font-size: 0.9rem; 
                    text-transform: uppercase; 
                    color: #636e72; 
                    margin-bottom: 1rem;
                    letter-spacing: 1px;
                }

                .mini-card {
                    background: white;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 0.75rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
                }

                .card-top {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.85rem;
                    margin-bottom: 0.5rem;
                }

                .card-top span { color: #94a3b8; }

                .value { font-size: 1.1rem; font-weight: 700; color: #007acc; }
                .description { font-size: 0.85rem; color: #475569; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }

                .no-res { font-size: 0.85rem; color: #94a3b8; font-style: italic; }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }

                .save-btn {
                    padding: 0.875rem 2.5rem;
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .cancel-btn { background: none; border: none; color: #636e72; font-weight: 600; cursor: pointer; }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .sidebar-loader {
                    padding: 2rem;
                    text-align: center;
                    color: #636e72;
                }

                .mipres-section {
                    background: #fdf4ff;
                    border: 1px dashed #d946ef;
                    border-radius: 16px;
                    padding: 1.5rem;
                    margin-bottom: 2rem;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .section-title h3 {
                    color: #a21caf;
                    margin: 0;
                    font-size: 1.1rem;
                }

                .beta-badge {
                    background: #d946ef;
                    color: white;
                    padding: 0.2rem 0.6rem;
                    border-radius: 99px;
                    font-size: 0.7rem;
                    font-weight: 700;
                }

                .mipres-form {
                    display: flex;
                    gap: 1rem;
                    align-items: flex-end;
                    flex-wrap: wrap;
                }

                .mipres-btn {
                    padding: 0.8rem 1.5rem;
                    background: #a21caf;
                    color: white;
                    border: none;
                    border-radius: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: transform 0.2s;
                }

                .mipres-btn:hover {
                    background: #86198f;
                    transform: scale(1.02);
                }

                .tech-select {
                    padding: 0.8rem;
                    border-radius: 10px;
                    border: 1px solid #e879f9;
                    background: white;
                    width: 100%;
                    min-width: 300px;
                }
            `}</style>
        </div>
    );
}
