'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function NewDiagnosticImagePage() {
    const params = useParams();
    const patientId = (params.params as any)?.patientId || params.patientId as string;
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        imageType: 'Radiografía',
        imageUrl: '',
        report: ''
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
            setForm(prev => ({ ...prev, imageUrl: data.url }));
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
            const response = await fetch(`/api/clinical/records/${patientId}/image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, patientDocument: patientId }),
            });

            if (!response.ok) throw new Error('Error al guardar la imagen');

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
                <h1>Nueva Imagen Diagnóstica</h1>
            </header>

            <PatientHeader patientId={patientId} />

            <form onSubmit={handleSubmit} className="clinical-form glass-panel">
                <div className="field-group">
                    <label>Tipo de Estudio *</label>
                    <select name="imageType" value={form.imageType} onChange={handleChange} required>
                        <option value="Radiografía">Radiografía</option>
                        <option value="Tomografía">Tomografía (TAC)</option>
                        <option value="Resonancia">Resonancia (RM)</option>
                        <option value="Ecografía">Ecografía</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="field-group file-upload-section">
                    <label>Archivo de Imagen *</label>
                    <div className="upload-controls">
                        <input type="file" onChange={handleFileUpload} disabled={uploading} accept="image/*" />
                        {uploading && <span className="upload-status">Subiendo...</span>}
                        {form.imageUrl && <span className="upload-success">✅ Imagen lista</span>}
                    </div>
                </div>

                <div className="field-group">
                    <label>Reporte Radiológico / Interpretación *</label>
                    <textarea
                        name="report"
                        value={form.report}
                        onChange={handleChange}
                        required
                        rows={8}
                        placeholder="Descripción detallada de los hallazgos por parte del radiólogo..."
                    />
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="button" onClick={() => router.back()} className="cancel-btn">Cancelar</button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Reporte'}
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

                .field-group {
                    margin-bottom: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                label { font-weight: 600; font-size: 0.9rem; color: #444; }

                input, select, textarea {
                    padding: 0.875rem 1rem;
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
                    padding: 0.875rem 2.5rem;
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
                    margin-bottom: 1.5rem;
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
