'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';
import Cie10Search from '@/components/ui/Cie10Search';

export default function NewConsultationPage() {
    const params = useParams();
    const patientId = (params.params as any)?.patientId || params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [dispenseData, setDispenseData] = useState({ productId: '', quantity: 1, notes: '' });
    const [dispenseStatus, setDispenseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Mock Inventory for selection
    const inventoryProducts = [
        { id: 'prod-001', name: 'Acetaminofen 500mg', stock: 150 },
        { id: 'prod-002', name: 'Ibuprofeno 400mg', stock: 80 },
        { id: 'prod-003', name: 'Dipirona 1g', stock: 45 },
        { id: 'prod-004', name: 'Tramadol 50mg', stock: 20 },
    ];

    const [form, setForm] = useState({
        doctorId: 'doc-001', // Mock doctor
        doctorName: 'Juan Perez',
        reasonForVisit: '',
        clinicalHistory: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        weight: '',
        height: '',
        physicalExamFindings: '',
        treatmentPlan: '',
        observations: '',
        diagnoses: [
            { code: '', description: '', type: 'Principal' }
        ]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleDiagnosisChange = (index: number, field: string, value: string) => {
        const newDiagnoses = [...form.diagnoses];
        // @ts-ignore
        newDiagnoses[index][field] = value;
        setForm(prev => ({ ...prev, diagnoses: newDiagnoses }));
    };

    const handleCie10Select = (index: number, item: any) => {
        const newDiagnoses = [...form.diagnoses];
        newDiagnoses[index].code = item.code;
        newDiagnoses[index].description = item.description;
        setForm(prev => ({ ...prev, diagnoses: newDiagnoses }));
    };

    const addDiagnosis = () => {
        setForm(prev => ({
            ...prev,
            diagnoses: [...prev.diagnoses, { code: '', description: '', type: 'Relacionado' }]
        }));
    };

    const removeDiagnosis = (index: number) => {
        if (form.diagnoses.length === 1) return;
        const newDiagnoses = form.diagnoses.filter((_, i) => i !== index);
        setForm(prev => ({ ...prev, diagnoses: newDiagnoses }));
    };

    const handleDispense = async () => {
        if (!dispenseData.productId || dispenseData.quantity <= 0) {
            alert('Seleccione un producto y cantidad válida');
            return;
        }

        setDispenseStatus('loading');
        try {
            const patient = { documentNumber: patientId }; // Placeholder
            const response = await fetch('/api/inventory/dispense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: dispenseData.productId,
                    quantity: dispenseData.quantity,
                    patientDocument: patient?.documentNumber || 'N/A',
                    clinicalRecordId: patientId, // Using patientId as proxy
                    notes: dispenseData.notes
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.message);

            setDispenseStatus('success');
            alert(`Suministro registrado. Stock restante: ${result.newStock}`);
            setDispenseData({ productId: '', quantity: 1, notes: '' });
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
            const response = await fetch(`/api/clinical/records/${patientId}/consultation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientDocument: patientId }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar la consulta');
            }

            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="new-consultation-container">
            <header className="form-header">
                <h1>Nueva Consulta Médica</h1>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <section className="form-section">
                    <h3>1. Anamnesis</h3>
                    <div className="field-group">
                        <label>Motivo de Consulta *</label>
                        <textarea
                            name="reasonForVisit"
                            value={form.reasonForVisit}
                            onChange={handleChange}
                            required
                            placeholder="Descripción breve del motivo de la consulta..."
                        />
                    </div>
                    <div className="field-group">
                        <label>Enfermedad Actual *</label>
                        <textarea
                            name="clinicalHistory"
                            value={form.clinicalHistory}
                            onChange={handleChange}
                            required
                            placeholder="Relato cronológico de la sintomatología..."
                            rows={5}
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>2. Constantes Vitales y Examen Físico</h3>
                    <div className="grid-vitals">
                        <div className="field-group">
                            <label>Tensión Arterial</label>
                            <input name="bloodPressure" value={form.bloodPressure} onChange={handleChange} placeholder="120/80" />
                        </div>
                        <div className="field-group">
                            <label>Frecuencia Cardíaca</label>
                            <input type="number" name="heartRate" value={form.heartRate} onChange={handleChange} placeholder="lp/m" />
                        </div>
                        <div className="field-group">
                            <label>Temp (°C)</label>
                            <input type="number" step="0.1" name="temperature" value={form.temperature} onChange={handleChange} placeholder="36.5" />
                        </div>
                        <div className="field-group">
                            <label>Peso (kg)</label>
                            <input type="number" step="0.1" name="weight" value={form.weight} onChange={handleChange} placeholder="70" />
                        </div>
                    </div>
                    <div className="field-group mt-4">
                        <label>Hallazgos Examen Físico *</label>
                        <textarea
                            name="physicalExamFindings"
                            value={form.physicalExamFindings}
                            onChange={handleChange}
                            required
                            placeholder="Descripción por sistemas..."
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>3. Impresión Diagnóstica (CIE-10)</h3>
                    {form.diagnoses.map((diag, index) => (
                        <div key={index} className="diagnosis-row flex gap-4 mb-4 items-start">
                            <div className="w-1/3">
                                <Cie10Search
                                    placeholder="Buscar código o nombre..."
                                    onSelect={(item) => handleCie10Select(index, item)}
                                />
                            </div>

                            <div className="flex-1">
                                <input
                                    className="desc-input w-full p-2 border rounded-lg bg-slate-50"
                                    placeholder="Descripción del diagnóstico"
                                    value={diag.description}
                                    onChange={(e) => handleDiagnosisChange(index, 'description', e.target.value)}
                                    required
                                    readOnly={!!diag.code} // If code selected, readonly description usually
                                />
                            </div>

                            <div className="w-40">
                                <select
                                    className="w-full p-2 border rounded-lg"
                                    value={diag.type}
                                    onChange={(e) => handleDiagnosisChange(index, 'type', e.target.value)}
                                >
                                    <option value="Principal">Principal</option>
                                    <option value="Relacionado">Relacionado</option>
                                </select>
                            </div>

                            <button type="button" onClick={() => removeDiagnosis(index)} className="text-red-500 hover:text-red-700 font-bold px-2">
                                🗑️
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addDiagnosis} className="add-btn">+ Agregar Diagnóstico</button>
                </section>

                <section className="form-section">
                    <h3>4. Plan de Manejo y Conducta</h3>
                    <div className="field-group">
                        <label>Tratamiento y Plan *</label>
                        <textarea
                            name="treatmentPlan"
                            value={form.treatmentPlan}
                            onChange={handleChange}
                            required
                            placeholder="Medicamentos, paraclínicos, recomendaciones..."
                            rows={4}
                        />
                    </div>
                </section>

                {error && <div className="error-message">{error}</div>}

                <section className="form-section">
                    <h3>5. Suministro de Medicamentos (Descarga de Inventario)</h3>
                    <div className="dispense-section glass-panel" style={{ padding: '1.5rem', border: '1px dashed #3b82f6', background: '#eff6ff' }}>
                        <div className="dispense-form" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                            <div className="field-group" style={{ flex: 2 }}>
                                <label>Producto / Medicamento</label>
                                <select
                                    className="tech-select"
                                    value={dispenseData.productId}
                                    onChange={(e) => setDispenseData({ ...dispenseData, productId: e.target.value })}
                                    style={{ borderColor: '#3b82f6', width: '100%' }}
                                >
                                    <option value="">-- Seleccionar del Inventario --</option>
                                    {inventoryProducts.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (Stock: {p.stock})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="field-group" style={{ flex: 1 }}>
                                <label>Cantidad</label>
                                <input
                                    type="number"
                                    min="1"
                                    className="tech-select" // reusing style
                                    value={dispenseData.quantity}
                                    onChange={(e) => setDispenseData({ ...dispenseData, quantity: parseInt(e.target.value) })}
                                    style={{ borderColor: '#3b82f6', width: '100%' }}
                                />
                            </div>
                            <div className="field-group" style={{ flex: 2 }}>
                                <label>Notas Adicionales</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Dosis inicial en consulta"
                                    className="tech-select"
                                    value={dispenseData.notes}
                                    onChange={(e) => setDispenseData({ ...dispenseData, notes: e.target.value })}
                                    style={{ borderColor: '#3b82f6', width: '100%' }}
                                />
                            </div>
                            <button
                                type="button"
                                className="dispense-btn"
                                onClick={handleDispense}
                                disabled={dispenseStatus === 'loading'}
                                style={{
                                    background: '#2563eb',
                                    color: 'white',
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    height: '50px',
                                    opacity: dispenseStatus === 'loading' ? 0.7 : 1
                                }}
                            >
                                {dispenseStatus === 'loading' ? 'Registrando...' : '📥 Registrar'}
                            </button>
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>

                    <button
                        type="button"
                        onClick={() => {
                            alert('⚠️ Funcionalidad en desarrollo: Por favor Guarde la consulta primero.');
                        }}
                        className="save-btn"
                        style={{ background: '#7c3aed', opacity: 0.8, marginRight: '1rem' }}
                    >
                        📄 Generar Orden
                    </button>

                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Historia Clínica'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .new-consultation-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                    --primary: #007acc;
                    --primary-dark: #005f99;
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                }

                .form-header {
                    margin-bottom: 2rem;
                    text-align: center;
                }

                .form-header h1 { color: var(--primary-dark); margin-bottom: 0.5rem; }
                .form-header p { color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 3rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .form-section {
                    margin-bottom: 2.5rem;
                    padding-bottom: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .form-section:last-of-type { border-bottom: none; }

                .form-section h3 {
                    color: var(--primary);
                    margin-bottom: 1.5rem;
                    font-size: 1.1rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .field-group {
                    margin-bottom: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #444;
                }

                textarea, input, select {
                    padding: 0.75rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: border-color 0.2s;
                    background: #f8fafc;
                }

                textarea:focus, input:focus, select:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .grid-vitals {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 1rem;
                    transition: transform 0.2s;
                }

                .add-btn {
                    background: none;
                    border: 2px dashed var(--primary);
                    color: var(--primary);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 0.5rem;
                }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 2rem;
                }

                .save-btn {
                    padding: 1rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }

                .save-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(0, 122, 204, 0.4);
                }

                .cancel-btn {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    font-weight: 600;
                    cursor: pointer;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 8px;
                    margin-bottom: 1.5rem;
                    text-align: center;
                    font-weight: 600;
                }

                .mt-4 { margin-top: 1rem; }
            `}</style>
        </div>
    );
}
