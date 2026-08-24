'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DOCUMENT_TYPES, Sex, Patient } from '@/types/patient';

export default function EditPatientPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        documentType: 'CC',
        documentNumber: '',
        dateOfBirth: '',
        sex: 'M' as Sex,
        address: '',
        phone: '',
        email: '',
        eps: '',
        regime: 'Contributivo' as any,
        status: 'Active' as any
    });

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                // Assuming you have an API to get a single patient, 
                // but checking patientService it seems we might need to use a general query or specific endpoint
                const response = await fetch(`/api/patients`);
                const allPatients: Patient[] = await response.json();
                const patient = allPatients.find(p => p.id === id);

                if (!patient) throw new Error('Paciente no encontrado');

                setForm({
                    firstName: patient.firstName,
                    lastName: patient.lastName,
                    documentType: patient.documentType,
                    documentNumber: patient.documentNumber,
                    dateOfBirth: patient.dateOfBirth,
                    sex: patient.sex,
                    address: patient.address,
                    phone: patient.phone,
                    email: patient.email || '',
                    eps: patient.eps,
                    regime: patient.regime,
                    status: patient.status
                });
            } catch (err: any) {
                setError(err.message);
            } finally {
                setFetchLoading(false);
            }
        };

        if (id) fetchPatient();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Need a PUT/PATCH endpoint in api/patients/[id] or handle in root api
            // For now, let's assume we implement a specific route or use a general one.
            // Since I haven't seen a [id] route in the API, I'll need to create it later if missing.
            const response = await fetch(`/api/patients/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Error al actualizar paciente');
            }

            router.push('/patients');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) return <div className="loading">Cargando datos del paciente...</div>;

    return (
        <div className="form-container">
            <header className="form-header">
                <h1>Editar Paciente</h1>
                <p>Actualice la informaci├│n del registro cl├¡nico</p>
            </header>

            <form onSubmit={handleSubmit} className="patient-form glass-panel">
                <section className="form-section">
                    <h3>Informaci├│n Personal</h3>
                    <div className="form-grid">
                        <div className="field-group">
                            <label>Nombres *</label>
                            <input name="firstName" value={form.firstName} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Apellidos *</label>
                            <input name="lastName" value={form.lastName} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Tipo Documento *</label>
                            <select name="documentType" value={form.documentType} onChange={handleChange}>
                                {DOCUMENT_TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="field-group">
                            <label>N├║mero Documento *</label>
                            <input name="documentNumber" value={form.documentNumber} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Fecha Nacimiento *</label>
                            <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Sexo *</label>
                            <select name="sex" value={form.sex} onChange={handleChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3>Contacto y Ubicaci├│n</h3>
                    <div className="form-grid">
                        <div className="field-group full">
                            <label>Direcci├│n</label>
                            <input name="address" value={form.address} onChange={handleChange} />
                        </div>
                        <div className="field-group">
                            <label>Tel├©fono *</label>
                            <input name="phone" value={form.phone} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>Correo Electr├│nico</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h3>Aseguramiento y Estado</h3>
                    <div className="form-grid">
                        <div className="field-group">
                            <label>EPS *</label>
                            <input name="eps" value={form.eps} onChange={handleChange} required />
                        </div>
                        <div className="field-group">
                            <label>R├©gimen *</label>
                            <select name="regime" value={form.regime} onChange={handleChange}>
                                <option value="Contributivo">Contributivo</option>
                                <option value="Subsidiado">Subsidiado</option>
                                <option value="Especial">Especial</option>
                            </select>
                        </div>
                        <div className="field-group">
                            <label>Estado *</label>
                            <select name="status" value={form.status} onChange={handleChange}>
                                <option value="Active">Activo</option>
                                <option value="Inactive">Inactivo</option>
                            </select>
                        </div>
                    </div>
                </section>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">
                        Cancelar
                    </button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .form-container {
                    padding: 2rem;
                    max-width: 900px;
                    margin: 0 auto;
                }

                .form-header { margin-bottom: 2rem; }
                .form-header h1 { color: #005f99; margin-bottom: 0.25rem; }
                .form-header p { color: #636e72; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .form-section {
                    margin-bottom: 2.5rem;
                }

                .form-section h3 {
                    font-size: 1.1rem;
                    color: #007acc;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #f1f5f9;
                }

                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                }

                .field-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .field-group.full {
                    grid-column: 1 / -1;
                }

                label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #475569;
                }

                input, select {
                    padding: 0.875rem 1rem;
                    border: 2px solid #dfe6e9;
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                    transition: all 0.2s;
                }

                input:focus, select:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                    padding-top: 1rem;
                }

                .save-btn {
                    padding: 1rem 2.5rem;
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .save-btn:hover {
                    background: #005f99;
                    transform: translateY(-2px);
                }

                .cancel-btn {
                    background: none;
                    border: none;
                    color: #64748b;
                    font-weight: 600;
                    cursor: pointer;
                }

                .error-message {
                    background: #fee2e2;
                    color: #dc2626;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    text-align: center;
                    font-size: 0.9rem;
                }

                .loading {
                    text-align: center;
                    padding: 5rem;
                    color: #64748b;
                }
            `}</style>
        </div>
    );
}
