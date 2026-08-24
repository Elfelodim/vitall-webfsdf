'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function NewLabResultPage() {
    const params = useParams();
    const patientId = (params.params as any)?.patientId || params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [fileUrl, setFileUrl] = useState('');

    const [form, setForm] = useState({
        testName: '',
        value: '',
        unit: '',
        referenceRange: '',
        status: 'Normal',
        observations: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Error al subir el archivo');

            const data = await response.json();
            setFileUrl(data.url);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/clinical/records/${patientId}/lab-result`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientDocument: patientId, fileUrl }),
            });

            if (!response.ok) throw new Error('Error al guardar el laboratorio');

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
                <h1>Nuevo Resultado de Laboratorio</h1>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="grid-fields">
                    <div className="field-group">
                        <label>Nombre de la Prueba *</label>
                        <input name="testName" value={form.testName} onChange={handleChange} required placeholder="Ej: Hemoglobina Glicosilada" />
                    </div>
                    <div className="field-group">
                        <label>Resultado *</label>
                        <input name="value" value={form.value} onChange={handleChange} required placeholder="Ej: 6.5" />
                    </div>
                    <div className="field-group">
                        <label>Unidad</label>
                        <input name="unit" value={form.unit} onChange={handleChange} placeholder="Ej: %" />
                    </div>
                    <div className="field-group">
                        <label>Rango de Referencia</label>
                        <input name="referenceRange" value={form.referenceRange} onChange={handleChange} placeholder="Ej: 4.0 - 5.6" />
                    </div>
                </div>

                <div className="field-group">
                    <label>Estado del Resultado</label>
                    <select name="status" value={form.status} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="Abnormal">Anormal (Fuera de rango)</option>
                        <option value="Critical">Crítico</option>
                    </select>
                </div>

                <div className="field-group">
                    <label>Observaciones</label>
                    <textarea name="observations" value={form.observations} onChange={handleChange} rows={3} />
                </div>

                <div className="field-group file-upload-section">
                    <label>Adjuntar Resultado (PDF o Imagen)</label>
                    <div className="upload-controls">
                        <input type="file" onChange={handleFileUpload} disabled={uploading} accept=".pdf,image/*" />
                        {uploading && <span className="upload-status">Subiendo...</span>}
                        {fileUrl && <span className="upload-success">✅ Archivo listo</span>}
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Resultado'}
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
                    --border-color: #dfe6e9;
                    --text-secondary: #636e72;
                }

                .form-header { margin-bottom: 2rem; }
                .form-header h1 { color: var(--primary-dark); }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    border: 1px solid rgba(255,255,255,0.5);
                }

                .grid-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1.5rem;
                    margin-bottom: 1.5rem;
                }

                .field-group {
                    margin-bottom: 1.25rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label { font-weight: 600; font-size: 0.9rem; color: #444; }

                input, select, textarea {
                    padding: 0.75rem 1rem;
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                }

                input:focus, select:focus, textarea:focus {
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
                    padding: 0.875rem 2rem;
                    background: var(--primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
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
                    margin-bottom: 1rem;
                    text-align: center;
                }

                .file-upload-section {
                    margin-top: 1rem;
                    padding: 1.5rem;
                    background: #f1f5f9;
                    border-radius: 12px;
                    border: 2px dashed #cbd5e1;
                }

                .upload-controls {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .upload-status {
                    font-size: 0.875rem;
                    color: var(--primary);
                    font-weight: 600;
                }

                .upload-success {
                    font-size: 0.875rem;
                    color: #059669;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
