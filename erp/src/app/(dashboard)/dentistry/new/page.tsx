'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';
import Odontogram from '@/components/clinical/Odontogram';

export default function NewDentalConsultationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = searchParams.get('patientId');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        doctorName: 'Dr. Odontólogo', // Mock
        reasonForVisit: '',
        treatmentPlan: '',
        observations: ''
    });

    const [odontogramState, setOdontogramState] = useState<Record<string, any>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) {
            alert('Error: No se ha identificado el paciente.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/dentistry/record', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    patientDocument: patientId,
                    odontogramData: odontogramState
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al guardar la historia dental');
            }

            alert('Historia Dental guardada exitosamente');
            router.push(`/dashboard/patients`); // Redirect to patient list or history
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!patientId) {
        return <div className="p-8 text-center text-red-500">Error: Paciente no especificado. Use la búsqueda de pacientes.</div>;
    }

    return (
        <div className="dental-consultation-container">
            <header className="form-header">
                <h1>Consulta Odontológica</h1>
                <p>Registro de Odontograma y Evolución</p>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <section className="form-section">
                    <h3>1. Anamnesis</h3>
                    <div className="field-group">
                        <label>Motivo de Consulta</label>
                        <textarea
                            name="reasonForVisit"
                            value={form.reasonForVisit}
                            onChange={handleChange}
                            required
                            placeholder="Dolor en muela, control, limpieza..."
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>2. Odontograma</h3>
                    <div className="odontogram-container">
                        <p className="instruction-text">Seleccione una herramienta/estado y haga clic en los dientes correspondientes.</p>
                        <Odontogram
                            value={odontogramState}
                            onChange={setOdontogramState}
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h3>3. Plan de Tratamiento y Obs.</h3>
                    <div className="field-group">
                        <label>Plan de Tratamiento</label>
                        <textarea
                            name="treatmentPlan"
                            value={form.treatmentPlan}
                            onChange={handleChange}
                            placeholder="Procedimientos a realizar..."
                            rows={3}
                        />
                    </div>
                    <div className="field-group">
                        <label>Observaciones</label>
                        <textarea
                            name="observations"
                            value={form.observations}
                            onChange={handleChange}
                            placeholder="Notas adicionales..."
                            rows={2}
                        />
                    </div>
                </section>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : '💾 Guardar Historia Odontológica'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .dental-consultation-container {
                    padding: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                    --primary: #0ea5e9; /* Sky blue for Dentistry */
                    --primary-dark: #0284c7;
                }
                
                .form-header { text-align: center; margin-bottom: 2rem; }
                .form-header h1 { color: var(--primary-dark); font-size: 2rem; margin: 0; }
                
                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
                    border: 1px solid #e2e8f0;
                }

                .form-section { margin-bottom: 2rem; }
                .form-section h3 { 
                    color: var(--primary); 
                    border-bottom: 2px solid #f0f9ff; 
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                }

                .field-group { margin-bottom: 1rem; }
                label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: #475569; }
                textarea { 
                    width: 100%; 
                    padding: 0.75rem; 
                    border: 1px solid #cbd5e1; 
                    border-radius: 8px;
                    resize: vertical;
                    min-height: 80px;
                }
                
                .instruction-text {
                    text-align: center;
                    color: #64748b;
                    margin-bottom: 1rem;
                    font-style: italic;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1rem;
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                }

                .save-btn {
                    background: var(--primary);
                    color: white;
                    padding: 0.8rem 2rem;
                    border-radius: 10px;
                    border: none;
                    font-weight: bold;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .save-btn:hover { background: var(--primary-dark); }
                .cancel-btn {
                    background: transparent;
                    color: #64748b;
                    padding: 0.8rem 2rem;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
