'use client';

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';

interface PatientHeaderProps {
    patientId: string;
}

export default function PatientHeader({ patientId }: PatientHeaderProps) {
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        async function fetchPatient() {
            try {
                const res = await fetch(`/api/patients/by-document/${patientId}`);
                if (res.ok) {
                    const data = await res.json();
                    setPatient(data);
                } else {
                    setError(true);
                }
            } catch (error) {
                console.error("Error fetching patient for header:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        if (patientId) {
            fetchPatient();
        } else {
            setError(true);
            setLoading(false); // Ensure loading is false if patientId is missing
        }
    }, [patientId]);

    if (error) {
        return <div className="patient-header-error">No se encontró información del paciente (ID: {patientId})</div>;
    }

    if (loading) {
        return <div className="patient-header-skeleton">Cargando datos del paciente...</div>;
    }

    if (!patient) return null;

    return (
        <div className="patient-info-header">
            <div className="info-item">
                <span className="label">Paciente</span>
                <span className="value">{patient.firstName} {patient.lastName}</span>
            </div>
            <div className="info-item">
                <span className="label">Documento</span>
                <span className="value">{patient.documentType} {patient.documentNumber}</span>
            </div>
            <div className="info-item">
                <span className="label">Sexo</span>
                <span className="value">{patient.sex}</span>
            </div>
            <div className="info-item">
                <span className="label">EPS</span>
                <span className="value">{patient.eps}</span>
            </div>

            <style jsx>{`
                .patient-info-header {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    background: #f1f5f9;
                    padding: 1rem 1.5rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                    margin-bottom: 1.5rem;
                }
                .info-item {
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    gap: 0.5rem;
                }
                .label {
                    font-size: 0.7rem;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    font-weight: 700;
                }
                .value {
                    font-size: 0.95rem;
                    color: #1e293b;
                    font-weight: 600;
                }
                .patient-header-skeleton {
                    padding: 1rem;
                    color: #64748b;
                    font-size: 0.85rem;
                    font-style: italic;
                }
                .patient-header-error {
                    padding: 1rem;
                    color: #dc2626;
                    background: #fee2e2;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-align: center;
                }
            `}</style>
        </div>
    );
}
