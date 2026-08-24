'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Patient {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    eps: string;
    status: string;
    dateOfBirth: string;
}

export default function DentistryPage() {
    const router = useRouter();
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await fetch('/api/patients');
            if (response.ok) {
                const data = await response.json();
                setPatients(data);
            }
        } catch (error) {
            console.error('Error fetching patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        `${patient.firstName} ${patient.lastName} ${patient.documentNumber}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const calculateAge = (dob: string) => {
        const birthDate = new Date(dob);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <div className="dentistry-container">
            <header className="page-header">
                <div>
                    <h1 className="title">Módulo de Odontología</h1>
                    <p className="subtitle">Gestión de Historias Clínicas Dentales y Odontogramas</p>
                </div>
            </header>

            <div className="search-bar glass-panel">
                <input
                    type="text"
                    placeholder="Buscar paciente por nombre o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="patients-grid">
                {loading ? (
                    <div className="loading">Cargando pacientes...</div>
                ) : filteredPatients.length === 0 ? (
                    <div className="no-results">No se encontraron pacientes.</div>
                ) : (
                    filteredPatients.map(patient => (
                        <div key={patient.id} className="patient-card glass-panel">
                            <div className="card-header">
                                <div className="avatar">
                                    {patient.firstName[0]}{patient.lastName[0]}
                                </div>
                                <div className="info">
                                    <h3>{patient.firstName} {patient.lastName}</h3>
                                    <span className="doc-id">CC {patient.documentNumber}</span>
                                </div>
                            </div>
                            <div className="card-body">
                                <div className="detail-row">
                                    <span>Edad:</span>
                                    <strong>{calculateAge(patient.dateOfBirth)} años</strong>
                                </div>
                                <div className="detail-row">
                                    <span>EPS:</span>
                                    <strong>{patient.eps}</strong>
                                </div>
                            </div>
                            <div className="card-actions">
                                <button
                                    onClick={() => router.push(`/dentistry/new?patientId=${patient.documentNumber}`)}
                                    className="action-btn primary-btn"
                                >
                                    🦷 Nueva Consulta
                                </button>
                                <button
                                    onClick={() => router.push(`/dashboard/clinical-history/${patient.documentNumber}`)}
                                    className="action-btn secondary-btn"
                                >
                                    📂 Ver Historial
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <style jsx>{`
                .dentistry-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }

                .title {
                    font-size: 2rem;
                    color: #0ea5e9; /* Sky Blue */
                    margin: 0;
                }

                .subtitle { color: #64748b; margin: 0.5rem 0 0; }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                }

                .search-bar { padding: 1.5rem; margin-bottom: 2rem; }

                .search-input {
                    width: 100%;
                    padding: 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 12px;
                    font-size: 1.1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .search-input:focus { border-color: #0ea5e9; }

                .patients-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 1.5rem;
                }

                .patient-card {
                    padding: 1.5rem;
                    transition: transform 0.2s;
                    display: flex;
                    flex-direction: column;
                }

                .patient-card:hover { transform: translateY(-5px); }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1rem;
                }

                .avatar {
                    width: 48px;
                    height: 48px;
                    background: #0ea5e9;
                    color: white;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 1.2rem;
                }

                .info h3 { margin: 0; color: #1e293b; font-size: 1.1rem; }
                .doc-id { color: #64748b; font-size: 0.9rem; }

                .card-body {
                    margin-bottom: 1.5rem;
                    background: rgba(255,255,255,0.5);
                    padding: 1rem;
                    border-radius: 8px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 0.5rem;
                    font-size: 0.9rem;
                    color: #475569;
                }

                .detail-row:last-child { margin-bottom: 0; }

                .card-actions {
                    margin-top: auto;
                    display: flex;
                    grid-gap: 0.5rem;
                }

                .action-btn {
                    flex: 1;
                    padding: 0.75rem;
                    border-radius: 8px;
                    border: none;
                    font-weight: 600;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }

                .primary-btn {
                    background: #0ea5e9;
                    color: white;
                }

                .primary-btn:hover { background: #0284c7; }

                .secondary-btn {
                    background: #e2e8f0;
                    color: #475569;
                }

                .secondary-btn:hover { background: #cbd5e1; }
            `}</style>
        </div>
    );
}
