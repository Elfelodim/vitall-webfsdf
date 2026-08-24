'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Patient } from '@/types/patient';

const PatientCard = ({ patient }: { patient: any }) => {
    const [billingOpen, setBillingOpen] = useState(false);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loadingInv, setLoadingInv] = useState(false);

    const toggleBilling = async () => {
        if (!billingOpen && invoices.length === 0) {
            setLoadingInv(true);
            try {
                const res = await fetch(`/api/billing/patient/${patient.documentNumber}`);
                if (res.ok) {
                    const data = await res.json();
                    setInvoices(data);
                }
            } catch (err) {
                console.error('Error fetching billing info:', err);
            } finally {
                setLoadingInv(false);
            }
        }
        setBillingOpen(!billingOpen);
    };

    return (
        <div className="patient-card glass-card">
            <div className="card-top">
                <div className="patient-avatar">
                    {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div className="patient-basic-info">
                    <h3>{patient.firstName} {patient.lastName}</h3>
                    <span className="doc-num">{patient.documentType}: {patient.documentNumber}</span>
                </div>
                <div className={`status-pill ${patient.status.toLowerCase()}`}>
                    {patient.status}
                </div>
            </div>

            <div className="card-details">
                <div className="detail-item">
                    <span className="label">EPS:</span>
                    <span className="value">{patient.eps || 'N/A'}</span>
                </div>
                <div className="detail-item">
                    <span className="label">Tel:</span>
                    <span className="value">{patient.phone || 'N/A'}</span>
                </div>
            </div>

            <div className="card-actions">
                <Link href={`/dashboard/clinical-history/${patient.documentNumber}`} className="action-btn clinical">
                    Historia Clínica
                </Link>
                <button onClick={toggleBilling} className={`action-btn billing ${billingOpen ? 'active' : ''}`}>
                    Facturación {invoices.length > 0 ? `(${invoices.length})` : ''}
                </button>
                <Link href={`/patients/${patient.id}`} className="action-btn edit">
                    Editar
                </Link>
            </div>

            {billingOpen && (
                <div className="billing-quickview">
                    {loadingInv ? (
                        <div className="mini-loader">Cargando...</div>
                    ) : invoices.length > 0 ? (
                        <div className="invoice-mini-list">
                            {invoices.map((inv: any) => (
                                <div key={inv.id} className="invoice-mini-item">
                                    <span className="inv-num">{inv.invoiceNumber}</span>
                                    <span className="inv-total">${inv.total.toLocaleString()}</span>
                                    <span className={`inv-status ${inv.status.toLowerCase()}`}>{inv.status}</span>
                                </div>
                            ))}
                            <Link href={`/dashboard/clinical-history/${patient.documentNumber}?tab=billing`} className="view-all-link">
                                Ver todas las facturas
                            </Link>
                        </div>
                    ) : (
                        <div className="no-invoices">No hay facturas registradas.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch('/api/patients');
                if (!response.ok) throw new Error('Error al cargar pacientes');
                const data = await response.json();
                setPatients(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.documentNumber.includes(searchTerm)
    );

    return (
        <div className="patients-container">
            <header className="page-header">
                <div className="title-section">
                    <h1>Pacientes</h1>
                    <p>Gesti├│n y registro de la base de datos de pacientes</p>
                </div>
                <Link href="/patients/new" className="add-btn">
                    + Registrar Paciente
                </Link>
            </header>

            <div className="search-bar glass-panel">
                <input
                    type="text"
                    placeholder="Buscar por nombre, apellido o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="loading">Cargando pacientes...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : (
                <div className="patients-grid">
                    {filteredPatients.length > 0 ? (
                        filteredPatients.map(patient => (
                            <PatientCard key={patient.id} patient={patient} />
                        ))
                    ) : (
                        <div className="no-results glass-panel">
                            No se encontraron pacientes que coincidan con la b├║squeda.
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .patients-container {
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

                .title-section h1 {
                    color: #005f99;
                    margin-bottom: 0.25rem;
                }

                .title-section p {
                    color: #636e72;
                }

                .add-btn {
                    background: #007acc;
                    color: white;
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .add-btn:hover {
                    background: #005f99;
                    transform: translateY(-2px);
                }

                .search-bar {
                    margin-bottom: 2rem;
                    padding: 1.5rem;
                }

                .search-bar input {
                    width: 100%;
                    padding: 0.875rem 1.5rem;
                    border: 2px solid #dfe6e9;
                    border-radius: 12px;
                    font-size: 1rem;
                    background: #f8fafc;
                }

                .search-bar input:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
                }

                .patients-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }

                .patient-card {
                    padding: 1.5rem;
                    transition: transform 0.2s;
                }

                .patient-card:hover {
                    transform: translateY(-4px);
                }

                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                    position: relative;
                }

                .avatar {
                    width: 50px;
                    height: 50px;
                    background: #e0f2fe;
                    color: #0369a1;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.25rem;
                }

                .name-info h3 {
                    margin: 0;
                    color: #1e293b;
                    font-size: 1.1rem;
                }

                .name-info span {
                    font-size: 0.85rem;
                    color: #64748b;
                }

                .status-badge {
                    position: absolute;
                    top: 0;
                    right: 0;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 600;
                }

                .status-badge.active { background: #dcfce7; color: #166534; }
                .status-badge.inactive { background: #fee2e2; color: #991b1b; }

                .card-body {
                    margin-bottom: 1.5rem;
                    display: grid;
                    gap: 0.5rem;
                }

                .info-item {
                    font-size: 0.9rem;
                    color: #475569;
                }

                .card-actions {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 0.75rem;
                }

                .action-btn {
                    padding: 0.6rem;
                    border-radius: 8px;
                    text-align: center;
                    font-size: 0.85rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.2s;
                }

                .action-btn.clinical {
                    background: #f0f9ff;
                    color: #0369a1;
                }

                .action-btn.edit {
                    background: #f8fafc;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                }

                .action-btn.billing {
                    background: #fdf2f2;
                    color: #991b1b;
                    border: none;
                    cursor: pointer;
                }

                .action-btn.billing.active {
                    background: #991b1b;
                    color: white;
                }

                .billing-quickview {
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px solid #e2e8f0;
                }

                .invoice-mini-list {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .invoice-mini-item {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    padding: 0.4rem;
                    background: #f8fafc;
                    border-radius: 6px;
                }

                .inv-num { font-weight: 700; }
                .inv-total { color: #166534; font-weight: 600; }
                .inv-status { 
                    font-size: 0.7rem; 
                    text-transform: uppercase; 
                    font-weight: 800;
                }
                .inv-status.paid { color: #166534; }
                .inv-status.draft { color: #64748b; }

                .view-all-link {
                    display: block;
                    text-align: center;
                    font-size: 0.75rem;
                    color: #007acc;
                    margin-top: 0.5rem;
                    font-weight: 700;
                }

                .loading, .error, .no-results {
                    text-align: center;
                    padding: 3rem;
                    color: #64748b;
                }
            `}</style>
        </div>
    );
}
