'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function NewOrderPage() {
    const router = useRouter();
    const params = useParams();
    const patientId = params.patientId as string;
    const searchParams = useSearchParams();
    const origin = searchParams.get('origin') || 'consultation'; // consultation | hospitalization
    const recordId = searchParams.get('recordId') || '';

    const [loading, setLoading] = useState(false);

    // Form State
    const [cupsSearch, setCupsSearch] = useState('');
    const [cupsResults, setCupsResults] = useState<any[]>([]);
    const [procedures, setProcedures] = useState<any[]>([]);

    const [medications, setMedications] = useState<any[]>([]);
    // Ideally duplicate product search logic from dispensing here, or reuse component (but simpler for now)

    const [incapacity, setIncapacity] = useState({
        active: false,
        days: 1,
        startDate: new Date().toISOString().split('T')[0],
        diagnosis: '',
        type: 'Enfermedad General',
        description: ''
    });

    const [recommendations, setRecommendations] = useState('');

    // CUPS Search
    useEffect(() => {
        if (cupsSearch.length > 3) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const res = await fetch(`/api/cups?q=${cupsSearch}`);
                    if (res.ok) setCupsResults(await res.json());
                } catch (e) { console.error(e); }
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setCupsResults([]);
        }
    }, [cupsSearch]);

    const addProcedure = (cup: any) => {
        if (!procedures.find(p => p.code === cup.code)) {
            setProcedures([...procedures, { ...cup, quantity: 1, notes: '' }]);
        }
        setCupsSearch('');
        setCupsResults([]);
    };

    const removeProcedure = (code: string) => {
        setProcedures(procedures.filter(p => p.code !== code));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                patientDocument: patientId,
                clinicalRecordId: recordId,
                recordType: origin === 'hospitalization' ? 'Hospitalization' : 'Consultation',
                doctorName: 'Dr. General', // Mock
                procedures: procedures,
                medications: [], // Future: Implement medication picking similarly
                incapacity: incapacity.active ? incapacity : {},
                recommendations: recommendations
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Error al generar orden');

            alert('Orden Médica Generada Exitosamente');
            router.back();
        } catch (error) {
            alert('Error: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="order-page-container">
            <header className="page-header">
                <h1>Generar Orden Médica</h1>
                <p>Anexo 1: Solicitud de Procedimientos y Servicios</p>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="order-form glass-panel">

                {/* 1. Procedimientos / CUPS */}
                <section className="form-section">
                    <h3>1. Procedimientos y Servicios (CUPS)</h3>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Buscar código o nombre de procedimiento (min. 4 caracteres)..."
                            value={cupsSearch}
                            onChange={e => setCupsSearch(e.target.value)}
                            className="search-input"
                        />
                        {cupsResults.length > 0 && (
                            <ul className="search-results">
                                {cupsResults.map(cup => (
                                    <li key={cup.id} onClick={() => addProcedure(cup)}>
                                        <strong>{cup.code}</strong> - {cup.description}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="selected-items">
                        {procedures.map(proc => (
                            <div key={proc.code} className="item-card">
                                <div className="item-header">
                                    <strong>{proc.code}</strong>
                                    <span>{proc.description}</span>
                                    <button type="button" onClick={() => removeProcedure(proc.code)} className="remove-btn">✕</button>
                                </div>
                                <div className="item-details">
                                    <input
                                        type="number" min="1"
                                        value={proc.quantity}
                                        className="qty-input"
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setProcedures(procedures.map(p => p.code === proc.code ? { ...p, quantity: val } : p));
                                        }}
                                    />
                                    <input
                                        type="text" placeholder="Indicación clínica / Observación"
                                        value={proc.notes}
                                        className="notes-input"
                                        onChange={(e) => {
                                            setProcedures(procedures.map(p => p.code === proc.code ? { ...p, notes: e.target.value } : p));
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        {procedures.length === 0 && <p className="empty-msg">No hay procedimientos seleccionados</p>}
                    </div>
                </section>

                {/* 2. Incapacidad */}
                <section className="form-section">
                    <div className="section-header-toggle">
                        <h3>2. Incapacidad Médica</h3>
                        <label className="switch">
                            <input
                                type="checkbox"
                                checked={incapacity.active}
                                onChange={e => setIncapacity({ ...incapacity, active: e.target.checked })}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>

                    {incapacity.active && (
                        <div className="incapacity-form">
                            <div className="row">
                                <div className="field">
                                    <label>Días</label>
                                    <input
                                        type="number" min="1" max="90"
                                        value={incapacity.days}
                                        onChange={e => setIncapacity({ ...incapacity, days: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="field">
                                    <label>Fecha Inicio</label>
                                    <input
                                        type="date"
                                        value={incapacity.startDate}
                                        onChange={e => setIncapacity({ ...incapacity, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="field">
                                    <label>Tipo</label>
                                    <select
                                        value={incapacity.type}
                                        onChange={e => setIncapacity({ ...incapacity, type: e.target.value })}
                                    >
                                        <option>Enfermedad General</option>
                                        <option>Licencia de Maternidad</option>
                                        <option>Accidente de Tránsito</option>
                                        <option>Accidente Laboral</option>
                                    </select>
                                </div>
                            </div>
                            <div className="field full-width">
                                <label>Descripción / Diagnóstico</label>
                                <textarea
                                    rows={2}
                                    value={incapacity.diagnosis}
                                    onChange={e => setIncapacity({ ...incapacity, diagnosis: e.target.value })}
                                    placeholder="Justificación clínica..."
                                />
                            </div>
                        </div>
                    )}
                </section>

                {/* 3. Recomendaciones */}
                <section className="form-section">
                    <h3>3. Plan de Manejo / Recomendaciones</h3>
                    <textarea
                        className="recommendations-area"
                        rows={4}
                        value={recommendations}
                        onChange={e => setRecommendations(e.target.value)}
                        placeholder="Recomendaciones para el paciente..."
                        required
                    />
                </section>

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Generando...' : '📄 Generar Orden Médica'}
                    </button>
                </div>

            </form>

            <style jsx>{`
                .order-page-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                }
                .page-header { text-align: center; margin-bottom: 2rem; }
                .glass-panel {
                    background: white;
                    border-radius: 16px;
                    padding: 2rem;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }

                .form-section { 
                    margin-bottom: 2.5rem;
                    border-bottom: 1px dashed #e2e8f0;
                    padding-bottom: 2rem;
                }
                .form-section:last-child { border-bottom: none; }
                
                h3 { color: #0f172a; margin-bottom: 1rem; border-left: 4px solid #3b82f6; padding-left: 0.75rem; }

                .search-box { position: relative; margin-bottom: 1rem; }
                .search-input {
                    width: 100%; padding: 0.75rem;
                    border: 2px solid #e2e8f0; border-radius: 8px;
                    font-size: 1rem;
                }
                .search-input:focus { outline: none; border-color: #3b82f6; }

                .search-results {
                    position: absolute; width: 100%; max-height: 200px; overflow-y: auto;
                    background: white; border: 1px solid #cbd5e1; border-radius: 8px;
                    list-style: none; padding: 0; margin: 0.5rem 0 0; z-index: 10;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .search-results li {
                    padding: 0.75rem; cursor: pointer; border-bottom: 1px solid #f1f5f9;
                }
                .search-results li:hover { background: #f0f9ff; }

                .item-card {
                    background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;
                    padding: 0.75rem; margin-bottom: 0.5rem;
                }
                .item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; font-size: 0.9rem; }
                .item-details { display: flex; gap: 0.5rem; }
                .qty-input { width: 70px; padding: 0.4rem; border-radius: 6px; border: 1px solid #cbd5e1; }
                .notes-input { flex: 1; padding: 0.4rem; border-radius: 6px; border: 1px solid #cbd5e1; }
                .remove-btn { background: none; border: none; color: #ef4444; font-weight: bold; cursor: pointer; }
                
                .section-header-toggle { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
                .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; }
                .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; }
                input:checked + .slider { background-color: #2196F3; }
                input:checked + .slider:before { transform: translateX(24px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                .incapacity-form { background: #f0fdf4; padding: 1.5rem; border-radius: 8px; border: 1px solid #bbf7d0; }
                .row { display: flex; gap: 1rem; margin-bottom: 1rem; }
                .field { display: flex; flex-direction: column; gap: 0.25rem; flex: 1; }
                .field label { font-size: 0.85rem; font-weight: 600; color: #166534; }
                .field input, .field select, .field textarea { padding: 0.5rem; border: 1px solid #86efac; border-radius: 6px; }

                .recommendations-area { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #cbd5e1; font-family: inherit; }

                .form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
                .save-btn { background: #3b82f6; color: white; padding: 0.75rem 2rem; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; }
                .save-btn:hover { background: #2563eb; }
                .cancel-btn { background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; }
            `}</style>
        </div>
    );
}
