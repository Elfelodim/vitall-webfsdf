"use client";

import { useEffect, useState } from 'react';
import { Patient } from '@/types/patient';
import Link from 'next/link';

export default function PatientList() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('/api/patients');
                if (!response.ok) throw new Error('Failed to fetch patients');
                const data = await response.json();
                setPatients(data);
            } catch (error) {
                console.error("Failed to fetch patients", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.documentNumber.includes(searchTerm)
    );

    return (
        <div className="patient-list-container">
            <div className="list-header">
                <h2 className="title">Directorio de Pacientes</h2>
                <div className="controls">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o documento..."
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Link href="/clinical/admissions" className="btn btn-primary">
                        + Nuevo Paciente
                    </Link>
                </div>
            </div>

            <div className="table-responsive">
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>Documento</th>
                            <th>Nombre Completo</th>
                            <th>EPS</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="loading-cell">Cargando pacientes...</td></tr>
                        ) : filteredPatients.length === 0 ? (
                            <tr><td colSpan={5} className="empty-cell">No se encontraron pacientes.</td></tr>
                        ) : (
                            filteredPatients.map((patient) => (
                                <tr key={patient.id}>
                                    <td>
                                        <span className="doc-type">{patient.documentType}</span>
                                        <span className="doc-num">{patient.documentNumber}</span>
                                    </td>
                                    <td className="patient-name">
                                        {patient.firstName} {patient.lastName}
                                    </td>
                                    <td>{patient.eps}</td>
                                    <td>
                                        <span className={`status-badge ${patient.status.toLowerCase()}`}>
                                            {patient.status}
                                        </span>
                                    </td>
                                    <td>
                                        <Link href={`/dashboard/clinical-history/${patient.id}`} className="btn-sm" style={{ display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                                            Ver Historia
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


        </div>
    );
}
