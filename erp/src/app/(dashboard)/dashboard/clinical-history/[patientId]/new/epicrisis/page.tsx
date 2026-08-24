'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function NewEpicrisisPage() {
    const params = useParams();
    const patientId = (params.params as any)?.patientId || params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        hospitalizationId: '',
        summary: '',
        treatments: '',
        recommendations: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/clinical/records/${patientId}/hospitalization/epicrisis`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientDocument: patientId }),
            });

            if (!response.ok) throw new Error('Error al registrar la epicrisis');

            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <header className="form-header">
                <h1>Epicrisis / Nota de Egreso</h1>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="field-group">
                    <label>ID de Hospitalización *</label>
                    <input name="hospitalizationId" value={form.hospitalizationId} onChange={handleChange} required placeholder="UUID de la estancia a cerrar" />
                </div>

                <div className="field-group">
                    <label>Resumen del Caso y Evolución *</label>
                    <textarea
                        name="summary"
                        value={form.summary}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Descripción sintética de la evolución y estado al alta..."
                    />
                </div>

                <div className="field-group">
                    <label>Tratamientos Recibidos *</label>
                    <textarea
                        name="treatments"
                        value={form.treatments}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Listado de intervenciones, cirugías y medicamentos..."
                    />
                </div>

                <div className="field-group">
                    <label>Recomendaciones y Plan de Seguimiento *</label>
                    <textarea
                        name="recommendations"
                        value={form.recommendations}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Citas de control, signos de alarma y medicación ambulatoria..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn discharge" disabled={loading}>
                        {loading ? 'Procesando Alta...' : 'Generar Epicrisis y Dar de Alta'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .form-container {
                    padding: 2rem;
                    max-width: 800px;
                    margin: 0 auto;
                    --primary: #007acc;
                    --primary-dark: #005f99;
                    --danger: #d63031;
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                }

                .form-header { margin-bottom: 2rem; }
                .form-header h1 { color: var(--primary-dark); margin-bottom: 0.25rem; }
                .form-header p { color: var(--text-secondary); font-size: 0.9rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
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
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                }

                input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--primary);
                    background: white;
                }

                .form-actions {
                    display: flex;
                    gap: 1.5rem;
                    justify-content: flex-end;
                    margin-top: 1rem;
                }

                .save-btn {
                    padding: 0.875rem 2.5rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .save-btn.discharge {
                    background: var(--danger);
                }

                .save-btn:hover { opacity: 0.9; transform: translateY(-1px); }

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
                    margin-bottom: 1rem;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
