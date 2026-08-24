'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function AnesthesiaPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const patientId = params.patientId as string;
    const initialSurgeryId = searchParams.get('surgeryId');

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        surgeryReportId: initialSurgeryId || '',
        anesthesiologist: '',
        anesthesiaType: 'General',
        asaScore: 'I',
        startTime: '',
        endTime: '',
        observations: '',

        // Complex fields
        vitalsLog: [] as any[], // { time, bp, hr, sat }
        medications: [] as any[] // { drug, dose, time }
    });

    // Temp inputs for logs
    const [newVital, setNewVital] = useState({ time: '', bp: '', hr: '', sat: '' });
    const [newMed, setNewMed] = useState({ drug: '', dose: '', time: '' });

    useEffect(() => {
        if (!initialSurgeryId) {
            // Optional: Validate if surgery exists or prompt user
        }
    }, [initialSurgeryId]);

    const addVital = () => {
        if (!newVital.time || !newVital.bp) return;
        setFormData({
            ...formData,
            vitalsLog: [...formData.vitalsLog, newVital]
        });
        setNewVital({ time: '', bp: '', hr: '', sat: '' });
    };

    const removeVital = (index: number) => {
        const newLogs = [...formData.vitalsLog];
        newLogs.splice(index, 1);
        setFormData({ ...formData, vitalsLog: newLogs });
    }

    const addMed = () => {
        if (!newMed.drug || !newMed.dose) return;
        setFormData({
            ...formData,
            medications: [...formData.medications, newMed]
        });
        setNewMed({ drug: '', dose: '', time: '' });
    };

    const removeMed = (index: number) => {
        const newMeds = [...formData.medications];
        newMeds.splice(index, 1);
        setFormData({ ...formData, medications: newMeds });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (!formData.surgeryReportId) {
            alert('Error: Debe vincular este registro a una cirugía (ID faltante).');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/clinical/anesthesia', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Error al guardar el registro');

            alert('Registro de Anestesia Guardado correctamente.');
            router.push(`/dashboard/clinical-history/${patientId}`);
        } catch (error) {
            alert('Error al guardar: ' + error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Registro de Anestesia</h1>
                    <p className="page-subtitle">Monitoreo intraoperatorio y administración de medicamentos.</p>
                </div>
                <div className="header-actions">
                    <button type="button" onClick={() => router.back()} className="btn-secondary">
                        ← Volver
                    </button>
                </div>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="main-form glass-panel fade-in">

                {/* ID Link Warning */}
                {!initialSurgeryId && (
                    <div className="warning-banner">
                        ⚠️ Este registro no está vinculado automáticamente. Por favor ingrese el ID de la cirugía manualmente.
                    </div>
                )}

                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🩺</span>
                        <h3>Datos Generales</h3>
                    </div>
                    <div className="grid-3">
                        <div className="form-group">
                            <label>ID Cirugía Vinculada</label>
                            <input
                                value={formData.surgeryReportId}
                                readOnly={!!initialSurgeryId}
                                onChange={e => setFormData({ ...formData, surgeryReportId: e.target.value })}
                                required
                                placeholder="ID requerido"
                                className="input-field readonly"
                            />
                        </div>
                        <div className="form-group">
                            <label>Anestesiólogo Responsable</label>
                            <input
                                required
                                value={formData.anesthesiologist}
                                onChange={e => setFormData({ ...formData, anesthesiologist: e.target.value })}
                                className="input-field"
                                placeholder="Dr. T. Anestesia"
                            />
                        </div>
                        <div className="form-group">
                            <label>Clasificación ASA</label>
                            <div className="select-wrapper">
                                <select
                                    value={formData.asaScore}
                                    onChange={e => setFormData({ ...formData, asaScore: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="I">ASA I - Paciente sano</option>
                                    <option value="II">ASA II - Enfermedad sistémica leve</option>
                                    <option value="III">ASA III - Enfermedad sistémica severa</option>
                                    <option value="IV">ASA IV - Amenaza para la vida</option>
                                    <option value="V">ASA V - Moribundo</option>
                                    <option value="E">E - Emergencia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="grid-3 mt-4">
                        <div className="form-group">
                            <label>Tipo de Anestesia</label>
                            <div className="select-wrapper">
                                <select
                                    value={formData.anesthesiaType}
                                    onChange={e => setFormData({ ...formData, anesthesiaType: e.target.value })}
                                    className="input-field"
                                >
                                    <option>General</option>
                                    <option>Regional / Raquídea</option>
                                    <option>Local + Sedación</option>
                                    <option>Local</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora Fin</label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>
                </section>

                {/* Signos Vitales Log */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">📈</span>
                        <h3>Monitoreo de Vitales</h3>
                    </div>

                    <div className="log-entry-card">
                        <div className="entry-row">
                            <div className="field-small">
                                <label>Hora</label>
                                <input type="time" value={newVital.time} onChange={e => setNewVital({ ...newVital, time: e.target.value })} className="input-field" />
                            </div>
                            <div className="field-medium">
                                <label>P. Arterial</label>
                                <input placeholder="120/80" value={newVital.bp} onChange={e => setNewVital({ ...newVital, bp: e.target.value })} className="input-field" />
                            </div>
                            <div className="field-small">
                                <label>FC (lpm)</label>
                                <input type="number" placeholder="80" value={newVital.hr} onChange={e => setNewVital({ ...newVital, hr: e.target.value })} className="input-field" />
                            </div>
                            <div className="field-small">
                                <label>SatO2 (%)</label>
                                <input type="number" placeholder="98" value={newVital.sat} onChange={e => setNewVital({ ...newVital, sat: e.target.value })} className="input-field" />
                            </div>
                            <div className="action-col">
                                <button type="button" onClick={addVital} className="btn-add">Agregar Registro</button>
                            </div>
                        </div>
                    </div>

                    {formData.vitalsLog.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Presión Arterial</th>
                                        <th>Frecuencia Cardíaca</th>
                                        <th>Saturación O2</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.vitalsLog.map((v, i) => (
                                        <tr key={i}>
                                            <td className="font-mono font-bold">{v.time}</td>
                                            <td>{v.bp} mmHg</td>
                                            <td>{v.hr} lpm</td>
                                            <td>
                                                <span className={`badge ${parseInt(v.sat) < 90 ? 'danger' : 'success'}`}>
                                                    {v.sat}%
                                                </span>
                                            </td>
                                            <td>
                                                <button type="button" onClick={() => removeVital(i)} className="btn-icon-delete" title="Eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">No hay registros de vitales aún.</div>
                    )}
                </section>

                {/* Medicamentos */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">💊</span>
                        <h3>Medicamentos Administrados</h3>
                    </div>

                    <div className="log-entry-card blue-theme">
                        <div className="entry-row">
                            <div className="field-small">
                                <label>Hora</label>
                                <input type="time" value={newMed.time} onChange={e => setNewMed({ ...newMed, time: e.target.value })} className="input-field" />
                            </div>
                            <div className="field-large">
                                <label>Fármaco</label>
                                <input placeholder="Nombre del medicamento" value={newMed.drug} onChange={e => setNewMed({ ...newMed, drug: e.target.value })} className="input-field" />
                            </div>
                            <div className="field-medium">
                                <label>Dosis</label>
                                <input placeholder="mg/mcg" value={newMed.dose} onChange={e => setNewMed({ ...newMed, dose: e.target.value })} className="input-field" />
                            </div>
                            <div className="action-col">
                                <button type="button" onClick={addMed} className="btn-add blue">Administrar</button>
                            </div>
                        </div>
                    </div>

                    {formData.medications.length > 0 ? (
                        <div className="table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Hora</th>
                                        <th>Fármaco</th>
                                        <th>Dosis Admin.</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {formData.medications.map((m, i) => (
                                        <tr key={i}>
                                            <td className="font-mono font-bold">{m.time}</td>
                                            <td className="font-bold text-blue-700">{m.drug}</td>
                                            <td>{m.dose}</td>
                                            <td>
                                                <button type="button" onClick={() => removeMed(i)} className="btn-icon-delete" title="Eliminar">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="empty-state">No hay medicamentos registrados.</div>
                    )}
                </section>

                <section className="form-section no-border">
                    <div className="section-header">
                        <span className="section-icon">📝</span>
                        <h3>Observaciones y Complicaciones</h3>
                    </div>
                    <div className="form-group">
                        <textarea
                            rows={4}
                            value={formData.observations}
                            onChange={e => setFormData({ ...formData, observations: e.target.value })}
                            className="textarea-field"
                            placeholder="Notas adicionales, eventos adversos, o observaciones del anestesiólogo..."
                        />
                    </div>
                </section>

                <div className="form-footer">
                    <button type="button" onClick={() => router.back()} className="btn-cancel">Cancelar</button>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? 'Guardando...' : '💾 Finalizar Registro de Anestesia'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    max-width: 1100px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                }

                .page-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                }

                .page-title {
                    font-size: 2.2rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .page-subtitle { color: #718096; font-size: 1rem; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
                    border-radius: 24px;
                    padding: 2.5rem;
                }

                .warning-banner {
                    background: #fffaf0;
                    color: #c05621;
                    padding: 1rem;
                    border-radius: 12px;
                    margin-bottom: 2rem;
                    border: 1px solid #feebc8;
                    font-weight: 600;
                }

                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .section-icon {
                    font-size: 1.5rem;
                    background: #ebf8ff;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                }
                
                .section-header h3 { font-size: 1.25rem; font-weight: 700; color: #2d3748; margin: 0; }

                .form-section { border-bottom: 1px dashed #e2e8f0; padding-bottom: 2rem; margin-bottom: 2rem; }
                .form-section.no-border { border-bottom: none; margin-bottom: 0; }

                .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
                .mt-4 { margin-top: 1.5rem; }

                .form-group label { font-size: 0.85rem; font-weight: 600; color: #4a5568; margin-bottom: 0.5rem; display: block; }
                
                .input-field, .textarea-field {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    background: #f8fafc;
                }

                .input-field:focus, .textarea-field:focus {
                    background: white;
                    border-color: #4299e1;
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
                }

                .input-field.readonly { background: #edf2f7; color: #718096; cursor: not-allowed; }

                /* Log Entry Card Styles */
                .log-entry-card {
                    background: #f7fafc;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #edf2f7;
                    margin-bottom: 1.5rem;
                }

                .log-entry-card.blue-theme { background: #ebf8ff; border-color: #bee3f8; }

                .entry-row {
                    display: flex;
                    align-items: flex-end;
                    gap: 1rem;
                    flex-wrap: wrap;
                }

                .field-small { width: 100px; }
                .field-medium { width: 140px; }
                .field-large { flex: 1; min-width: 200px; }
                .action-col { flex: 0 0 auto; }

                .btn-add {
                    background: #2d3748;
                    color: white;
                    border: none;
                    padding: 0.75rem 1.5rem;
                    border-radius: 10px;
                    font-weight: 600;
                    cursor: pointer;
                    height: 46px; 
                    transition: all 0.2s;
                }

                .btn-add:hover { background: #1a202c; transform: translateY(-1px); }
                
                .btn-add.blue { background: #3182ce; }
                .btn-add.blue:hover { background: #2b6cb0; }

                /* Table Styles */
                .table-container {
                    overflow-x: auto;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }

                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    background: white;
                }

                .data-table th {
                    background: #f1f5f9;
                    text-align: left;
                    padding: 1rem;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    color: #64748b;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                }

                .data-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                }

                .data-table tr:last-child td { border-bottom: none; }
                
                .badge { padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; }
                .badge.success { background: #def7ec; color: #03543f; }
                .badge.danger { background: #fde8e8; color: #9b1c1c; }

                .btn-icon-delete {
                    background: none;
                    border: none;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }
                .btn-icon-delete:hover { opacity: 1; }

                .empty-state { text-align: center; padding: 2rem; color: #a0aec0; font-style: italic; }

                .font-mono { font-family: monospace; }
                .text-blue-700 { color: #2b6cb0; }

                .form-footer {
                    margin-top: 2rem;
                    padding-top: 2rem;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    justify-content: flex-end;
                    gap: 1.5rem;
                }

                .btn-save {
                    background: #48bb78;
                    color: white;
                    border: none;
                    padding: 1rem 2.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(72, 187, 120, 0.2);
                }

                .btn-save:hover { background: #38a169; transform: translateY(-2px); }

                .btn-cancel, .btn-secondary {
                    background: white;
                    color: #718096;
                    border: 2px solid #e2e8f0;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-cancel:hover, .btn-secondary:hover { background: #f7fafc; border-color: #cbd5e0; color: #4a5568; }
            `}</style>
        </div>
    );
}
