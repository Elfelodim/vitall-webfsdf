"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { patientService } from '@/lib/services/patientService';
import { medicalRecordService } from '@/lib/services/medicalRecordService';
import { Patient } from '@/types/patient';
import { MOCK_CIE10 } from '@/types/medicalRecord';

export default function ConsultationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [formData, setFormData] = useState({
        reasonForConsultation: '',
        currentIllness: '',
        bloodPressure: '',
        heartRate: '',
        respiratoryRate: '',
        temperature: '',
        weight: '',
        height: '',
        physicalExamFindings: '',
        diagnosisCode: '',
        treatmentPlan: ''
    });

    useEffect(() => {
        patientService.getPatientById(params.id).then(p => setPatient(p || null));
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patient) return;

        // Find diagnosis description
        const diag = MOCK_CIE10.find(d => d.code === formData.diagnosisCode);

        await medicalRecordService.createConsultation({
            patientId: patient.id,
            doctorId: 'DOC-001',
            reasonForConsultation: formData.reasonForConsultation,
            currentIllness: formData.currentIllness,
            vitals: {
                bloodPressure: formData.bloodPressure,
                heartRate: Number(formData.heartRate),
                respiratoryRate: Number(formData.respiratoryRate),
                temperature: Number(formData.temperature),
                weight: Number(formData.weight),
                height: Number(formData.height)
            },
            physicalExamFindings: formData.physicalExamFindings,
            diagnosis: diag ? [{ ...diag, type: 'Principal' }] : [],
            treatmentPlan: formData.treatmentPlan
        });

        router.push(`/clinical/patient/${patient.id}`);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!patient) return <div className="p-4">Cargando paciente...</div>;

    return (
        <div className="consultation-page">
            <div className="page-header">
                <h1 className="page-title">Nueva Consulta</h1>
                <p className="page-subtitle">Paciente: {patient.firstName} {patient.lastName} ({calculateAge(patient.dateOfBirth)} años)</p>
            </div>

            <form onSubmit={handleSubmit} className="consultation-form">

                <div className="form-section card">
                    <h3 className="fs-title">Anamnesis</h3>
                    <div className="form-group">
                        <label>Motivo de Consulta</label>
                        <input type="text" name="reasonForConsultation" required value={formData.reasonForConsultation} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label>Enfermedad Actual</label>
                        <textarea name="currentIllness" rows={4} required value={formData.currentIllness} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-section card">
                    <h3 className="fs-title">Signos Vitales</h3>
                    <div className="vitals-grid">
                        <div className="form-group">
                            <label>P.A (mmHg)</label>
                            <input type="text" name="bloodPressure" placeholder="120/80" value={formData.bloodPressure} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>F.C (lpm)</label>
                            <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>F.R (rpm)</label>
                            <input type="number" name="respiratoryRate" value={formData.respiratoryRate} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Temp (°C)</label>
                            <input type="number" name="temperature" step="0.1" value={formData.temperature} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Peso (kg)</label>
                            <input type="number" name="weight" value={formData.weight} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Talla (cm)</label>
                            <input type="number" name="height" value={formData.height} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                <div className="form-section card">
                    <h3 className="fs-title">Examen Físico</h3>
                    <div className="form-group">
                        <label>Hallazgos</label>
                        <textarea name="physicalExamFindings" rows={4} value={formData.physicalExamFindings} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-section card">
                    <h3 className="fs-title">Diagnóstico y Plan</h3>
                    <div className="form-group">
                        <label>Diagnóstico Principal (CIE-10)</label>
                        <select name="diagnosisCode" required value={formData.diagnosisCode} onChange={handleChange}>
                            <option value="">Seleccione...</option>
                            {MOCK_CIE10.map(d => (
                                <option key={d.code} value={d.code}>{d.code} - {d.description}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Plan de Tratamiento</label>
                        <textarea name="treatmentPlan" rows={4} required value={formData.treatmentPlan} onChange={handleChange} />
                    </div>
                </div>

                <div className="form-actions sticky-footer">
                    <button type="button" className="btn" onClick={() => router.back()}>Cancelar</button>
                    <button type="submit" className="btn btn-primary">Finalizar Consulta</button>
                </div>

            </form>

            <style jsx>{`
        .consultation-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .fs-title {
           font-size: 1.1rem;
           color: var(--primary-dark);
           margin-bottom: 16px;
           padding-bottom: 8px;
           border-bottom: 1px solid var(--border-color);
        }

        .vitals-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 16px;
        }

        textarea {
          padding: 10px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius);
          font-family: inherit;
          resize: vertical;
        }

        .sticky-footer {
          position: sticky;
          bottom: 0;
          background: var(--background-color);
          padding: 16px;
          border-top: 1px solid var(--border-color);
          z-index: 10;
        }
       `}</style>
        </div>
    );
}

function calculateAge(dob: string) {
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
