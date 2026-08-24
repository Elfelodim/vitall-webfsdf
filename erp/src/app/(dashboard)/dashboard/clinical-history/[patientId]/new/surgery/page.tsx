'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Cie10Search from '@/components/ui/Cie10Search';
import CupsSearch from '@/components/ui/CupsSearch';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function SurgeryPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.patientId as string;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        surgeonName: '',
        assistantName: '',
        anesthesiologistName: '',
        startTime: '',
        endTime: '',
        surgeryType: 'Elective',

        preOpDiagnosis: '',
        postOpDiagnosis: '',

        procedureName: '',
        procedureCode: '',

        description: '',
        findings: '',
        complications: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/clinical/surgery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    patientDocument: patientId
                })
            });

            if (!res.ok) throw new Error('Error al guardar el informe');

            const savedReport = await res.json();

            // Ask if they want to create anesthesia record now
            if (confirm('Informe guardado. ¿Desea crear el Registro de Anestesia ahora?')) {
                router.push(`/dashboard/clinical-history/${patientId}/new/anesthesia?surgeryId=${savedReport.id}`);
            } else {
                router.back();
            }
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
                    <h1 className="page-title">Informe Quirúrgico</h1>
                    <p className="page-subtitle">Registro detallado de procedimiento quirúrgico y hallazgos.</p>
                </div>
                <div className="header-actions">
                    <button type="button" onClick={() => router.back()} className="btn-secondary">
                        ← Volver al Tablero
                    </button>
                </div>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="main-form glass-panel fade-in">
                {/* Equipo Quirúrgico */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">👥</span>
                        <h3>Equipo Quirúrgico</h3>
                    </div>
                    <div className="grid-3">
                        <div className="form-group">
                            <label>Cirujano Principal</label>
                            <input
                                required
                                value={formData.surgeonName}
                                onChange={e => setFormData({ ...formData, surgeonName: e.target.value })}
                                placeholder="Dr. Nombre Apellido"
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Ayudante</label>
                            <input
                                value={formData.assistantName}
                                onChange={e => setFormData({ ...formData, assistantName: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Anestesiólogo</label>
                            <input
                                value={formData.anesthesiologistName}
                                onChange={e => setFormData({ ...formData, anesthesiologistName: e.target.value })}
                                className="input-field"
                            />
                        </div>
                    </div>
                </section>

                {/* Tiempos y Tipo */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">⏱️</span>
                        <h3>Detalles de Tiempo y Tipo</h3>
                    </div>
                    <div className="grid-4">
                        <div className="form-group">
                            <label>Fecha del Procedimiento</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora Inicio</label>
                            <input
                                type="time"
                                required
                                value={formData.startTime}
                                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Hora Finalización</label>
                            <input
                                type="time"
                                required
                                value={formData.endTime}
                                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                className="input-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Tipo de Cirugía</label>
                            <div className="select-wrapper">
                                <select
                                    value={formData.surgeryType}
                                    onChange={e => setFormData({ ...formData, surgeryType: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="Elective">Electiva</option>
                                    <option value="Urgent">Urgencia</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Diagnósticos */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🩺</span>
                        <h3>Diagnósticos (CIE-10)</h3>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Diagnóstico Pre-Operatorio</label>
                            <div className="search-wrapper">
                                <Cie10Search
                                    onSelect={(item) => setFormData({ ...formData, preOpDiagnosis: `${item.code} - ${item.description}` })}
                                    placeholder="Buscar código o nombre..."
                                />
                            </div>
                            {formData.preOpDiagnosis && (
                                <div className="selected-tag pre-op">
                                    <span className="tag-label">Pre-Op:</span>
                                    {formData.preOpDiagnosis}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Diagnóstico Post-Operatorio</label>
                            <div className="search-wrapper">
                                <Cie10Search
                                    onSelect={(item) => setFormData({ ...formData, postOpDiagnosis: `${item.code} - ${item.description}` })}
                                    placeholder="Buscar código o nombre..."
                                />
                            </div>
                            {formData.postOpDiagnosis && (
                                <div className="selected-tag post-op">
                                    <span className="tag-label">Post-Op:</span>
                                    {formData.postOpDiagnosis}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Procedimiento */}
                <section className="form-section">
                    <div className="section-header">
                        <span className="section-icon">🔪</span>
                        <h3>Procedimiento Realizado (CUPS)</h3>
                    </div>
                    <div className="form-group">
                        <label>Buscar Procedimiento Quirúrgico</label>
                        <div className="search-wrapper large">
                            <CupsSearch
                                onSelect={(item) => setFormData({
                                    ...formData,
                                    procedureCode: item.code,
                                    procedureName: item.description
                                })}
                                placeholder="Escriba el código CUPS o nombre del procedimiento..."
                            />
                        </div>
                        {formData.procedureName && (
                            <div className="selected-procedure-card">
                                <div className="procedure-code">{formData.procedureCode}</div>
                                <div className="procedure-name">{formData.procedureName}</div>
                                <div className="procedure-check">✓</div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Descripción y Hallazgos */}
                <section className="form-section no-border">
                    <div className="section-header">
                        <span className="section-icon">📝</span>
                        <h3>Descripción y Hallazgos</h3>
                    </div>
                    <div className="form-group mb-4">
                        <label>Descripción Técnica</label>
                        <textarea
                            rows={8}
                            required
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describa detalladamente la técnica quirúrgica, abordaje, y pasos realizados..."
                            className="textarea-field"
                        />
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label>Hallazgos Quirúrgicos</label>
                            <textarea
                                rows={4}
                                required
                                value={formData.findings}
                                onChange={e => setFormData({ ...formData, findings: e.target.value })}
                                placeholder="Describa los hallazgos relevantes durante la cirugía..."
                                className="textarea-field"
                            />
                        </div>
                        <div className="form-group">
                            <label>Complicaciones (Si hubo)</label>
                            <textarea
                                rows={4}
                                value={formData.complications}
                                onChange={e => setFormData({ ...formData, complications: e.target.value })}
                                placeholder="Describa complicaciones o eventos adversos (Dejar vacío si no hubo)..."
                                className="textarea-field"
                            />
                        </div>
                    </div>
                </section>

                <div className="form-footer">
                    <button type="button" onClick={() => router.back()} className="btn-cancel">
                        Cancelar Operación
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner">⏳ Guardando...</span>
                        ) : (
                            <>
                                <span>💾 Guardar Informe Quirúrgico</span>
                            </>
                        )}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    max-width: 1200px;
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
                    background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 0.5rem;
                }

                .page-subtitle {
                    color: #718096;
                    font-size: 1rem;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 10px 40px -10px rgba(0,0,0,0.05);
                    border-radius: 24px;
                    padding: 3rem;
                }

                .fade-in {
                    animation: fadeIn 0.4s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .form-section {
                    margin-bottom: 3rem;
                    padding-bottom: 2rem;
                    border-bottom: 1px dashed #e2e8f0;
                }

                .form-section.no-border {
                    border-bottom: none;
                    margin-bottom: 1rem;
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

                .section-header h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin: 0;
                }

                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
                .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; }
                .grid-4 { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.5rem; }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.6rem;
                }

                .form-group label {
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: #4a5568;
                    margin-left: 0.2rem;
                }

                .input-field, .textarea-field {
                    padding: 0.8rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1rem;
                    transition: all 0.2s;
                    background: #f8fafc;
                    width: 100%;
                }

                .input-field:focus, .textarea-field:focus {
                    outline: none;
                    border-color: #4299e1;
                    background: white;
                    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
                }

                .textarea-field {
                    resize: vertical;
                    line-height: 1.6;
                }

                .select-wrapper {
                    position: relative;
                }

                .selected-tag {
                    margin-top: 0.75rem;
                    padding: 0.75rem 1rem;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .tag-label {
                    font-weight: 700;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    opacity: 0.7;
                }

                .selected-tag.pre-op { background: #ebf4ff; color: #2b6cb0; border: 1px solid #bee3f8; }
                .selected-tag.post-op { background: #f0fff4; color: #2f855a; border: 1px solid #c6f6d5; }

                .selected-procedure-card {
                    margin-top: 1rem;
                    background: linear-gradient(135deg, #3182ce 0%, #2c5282 100%);
                    color: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    box-shadow: 0 10px 15px -3px rgba(66, 153, 225, 0.3);
                }

                .procedure-code {
                    background: rgba(255,255,255,0.2);
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-weight: 800;
                    font-family: monospace;
                    font-size: 1.1rem;
                }

                .procedure-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    flex: 1;
                }

                .procedure-check {
                    background: white;
                    color: #2c5282;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                }

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
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }

                .btn-save:hover {
                    background: #38a169;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 12px rgba(72, 187, 120, 0.3);
                }

                .btn-save:disabled {
                    background: #cbd5e0;
                    cursor: not-allowed;
                    transform: none;
                    box-shadow: none;
                }

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

                .btn-cancel:hover, .btn-secondary:hover {
                    background: #f7fafc;
                    border-color: #cbd5e0;
                    color: #4a5568;
                }

                .mb-4 { margin-bottom: 2rem; }
            `}</style>
        </div>
    );
}
