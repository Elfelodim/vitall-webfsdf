'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import PatientHeader from '@/components/clinical/PatientHeader';

export default function PatientHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const patientId = params.patientId as string;

    const [activeTab, setActiveTab] = useState('chronology');
    const [history, setHistory] = useState<any>(null);
    const [chronology, setChronology] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch full history, chronology and invoices
                const [histRes, chronRes, invRes] = await Promise.all([
                    fetch(`/api/clinical/records/${patientId}`),
                    fetch(`/api/clinical/records/${patientId}?view=chronology`),
                    fetch(`/api/billing/patient/${patientId}`) // patientId is actually documentNumber here
                ]);

                if (!histRes.ok || !chronRes.ok) throw new Error('Error al cargar la historia clínica');

                const histData = await histRes.json();
                const chronData = await chronRes.json();
                const invData = invRes.ok ? await invRes.json() : [];

                setHistory(histData);
                setChronology(chronData);
                setInvoices(invData);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) fetchData();
    }, [patientId]);

    if (loading) return <div className="loading-container"><div className="loader"></div><p>Cargando historia cl├¡nica...</p></div>;
    if (error) return <div className="error-container"><h3>Error</h3><p>{error}</p></div>;

    const renderChronology = () => (
        <div className="timeline">
            {chronology.length > 0 ? (
                chronology.map((event, idx) => (
                    <div key={event.id} className={`timeline-item ${event.type.toLowerCase()}`}>
                        <div className="timeline-marker"></div>
                        <div className="timeline-content glass-panel-small">
                            <div className="event-header">
                                <span className={`event-type-badge ${event.type.toLowerCase()}`}>
                                    {event.type === 'Hospitalization' ? '🏥 Hospitalización' : '🩺 Consulta'}
                                </span>
                                <span className="event-date">
                                    {event.type === 'Hospitalization'
                                        ? `${new Date(event.admissionDate).toLocaleDateString()} - ${event.dischargeDate ? new Date(event.dischargeDate).toLocaleDateString() : 'Activo'}`
                                        : new Date(event.date).toLocaleDateString()
                                    }
                                </span>
                            </div>

                            <h3>{event.title}</h3>
                            <p className="event-desc">{event.description}</p>

                            <div className="event-meta">
                                <span><strong>Médico:</strong> {event.doctor}</span>
                                {event.status && (
                                    <span className={`status-badge ${event.status.toLowerCase()}`}>
                                        {event.status === 'Active' ? 'En Curso' : 'Finalizado'}
                                    </span>
                                )}
                            </div>

                            {event.type === 'Hospitalization' && event.evolutions?.length > 0 && (
                                <div className="event-details">
                                    <h4>Últimas Evoluciones</h4>
                                    <div className="mini-evolutions">
                                        {event.evolutions.slice(0, 3).map((evo: any) => (
                                            <div key={evo.id} className="mini-evo">
                                                <span className="mini-date">{new Date(evo.createdAt).toLocaleDateString()}</span>
                                                <span className="mini-note">{evo.subjective.substring(0, 100)}...</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="event-actions">
                                        {event.status === 'Active' && (
                                            <button
                                                onClick={() => router.push(`/dashboard/clinical-history/${patientId}/new/evolution?hospId=${event.id}`)}
                                                className="action-link"
                                            >
                                                + Evolucionar
                                            </button>
                                        )}
                                        {event.status === 'Active' && (
                                            <button
                                                onClick={() => router.push(`/dashboard/clinical-history/${patientId}/new/epicrisis?hospId=${event.id}`)}
                                                className="action-link discharge"
                                            >
                                                Dar Egreso (Epicrisis)
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {event.type === 'Consultation' && (
                                <div className="event-details">
                                    <div className="consult-preview">
                                        <strong>Motivo:</strong> {event.description}
                                    </div>
                                    <button className="view-more-btn">Ver Detalle Completo</button>
                                </div>
                            )}
                        </div>
                    </div>
                ))
            ) : (
                <div className="no-data">No hay eventos registrados en la cronología.</div>
            )}
        </div>
    );

    const renderConsultations = () => (
        <div className="tab-content">
            {history.consultations?.length > 0 ? (
                history.consultations.map((c: any) => (
                    <div key={c.id} className="consultation-card">
                        <div className="card-header">
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            <span>Dr. {c.doctorName}</span>
                        </div>
                        <h3>Consulta Externa</h3>
                        <p><strong>Motivo:</strong> {c.reasonForVisit}</p>
                        <p><strong>Subjetivo:</strong> {c.subjective}</p>
                        {c.diagnoses?.length > 0 && (
                            <div className="diagnoses-list">
                                {c.diagnoses.map((d: any) => (
                                    <span key={d.id} className="diag-badge">{d.code}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            ) : <div className="no-data">No hay consultas externas registradas.</div>}
        </div>
    );

    const renderHospitalizations = () => (
        <div className="tab-content">
            {history.hospitalizations?.length > 0 ? (
                history.hospitalizations.map((h: any) => (
                    <div key={h.id} className={`hosp-card ${h.status.toLowerCase()}`}>
                        <div className="hosp-header">
                            <div>
                                <span className={`badge ${h.status.toLowerCase()}`}>
                                    {h.status === 'Active' ? 'ACTIVA' : 'EGRESADA'}
                                </span>
                                <h2>Cama: {h.bedNumber}</h2>
                            </div>
                            <div className="hosp-dates">
                                <div>Ingreso: {new Date(h.admissionDate).toLocaleDateString()}</div>
                                {h.epicrisis && <div>Egreso: {new Date(h.epicrisis.date).toLocaleDateString()}</div>}
                            </div>
                        </div>

                        <div className="hosp-info">
                            <p><strong>Diagnóstico Ingreso:</strong> {h.admissionDiagnosis}</p>
                            <p><strong>Médico Tratante:</strong> {h.doctorInCharge}</p>
                        </div>

                        {h.evolutions?.length > 0 && (
                            <div className="evolutions-section">
                                <h4>Historial de Evoluciones</h4>
                                {h.evolutions.map((evo: any) => (
                                    <div key={evo.id} className="evo-mini-card">
                                        <span className="evo-date">{new Date(evo.createdAt).toLocaleString()}</span>
                                        <div className="evo-summary">{evo.subjective}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {h.epicrisis && (
                            <div className="epicrisis-summary">
                                <h4>Resumen de Egreso (Epicrisis)</h4>
                                <p>{h.epicrisis.summary}</p>
                            </div>
                        )}
                    </div>
                ))
            ) : <div className="no-data">No hay hospitalizaciones registradas.</div>}
        </div>
    );

    return (
        <div className="history-container">
            <header className="page-header">
                <div className="patient-info-header-row">
                    <h1>Historial Clínico</h1>
                    <div className="header-actions">
                        <Link href={`/dashboard/clinical-history/${patientId}/new/consultation`} className="btn-primary">
                            + Nueva Consulta
                        </Link>
                        <Link href={`/dashboard/clinical-history/${patientId}/new/admission`} className="btn-secondary">
                            + Nuevo Ingreso (Hosp)
                        </Link>
                        <Link href={`/dashboard/clinical-history/${patientId}/new/surgery`} className="btn-secondary">
                            🔪 Cirugía
                        </Link>
                        <Link href={`/dashboard/clinical-history/${patientId}/new/anesthesia`} className="btn-secondary">
                            💉 Anestesia
                        </Link>
                    </div>
                </div>

                <PatientHeader patientId={patientId as string} />
            </header>

            <nav className="history-tabs">
                <button className={activeTab === 'chronology' ? 'active' : ''} onClick={() => setActiveTab('chronology')}>
                    <span>📅</span> Cronología de Eventos
                </button>
                <button className={activeTab === 'hospitalizations' ? 'active' : ''} onClick={() => setActiveTab('hospitalizations')}>
                    <span>🏥</span> Hospitalizaciones
                </button>
                <button className={activeTab === 'consultations' ? 'active' : ''} onClick={() => setActiveTab('consultations')}>
                    <span>🩺</span> Consultas
                </button>
                <button className={activeTab === 'labs' ? 'active' : ''} onClick={() => setActiveTab('labs')}>
                    <span>🧪</span> Laboratorios
                </button>
                <button className={activeTab === 'images' ? 'active' : ''} onClick={() => setActiveTab('images')}>
                    <span>🖼️</span> Imágenes
                </button>
                <button className={activeTab === 'scans' ? 'active' : ''} onClick={() => setActiveTab('scans')}>
                    <span>📟</span> Escaneos
                </button>
                <button className={activeTab === 'billing' ? 'active' : ''} onClick={() => setActiveTab('billing')}>
                    <span>💰</span> Facturación
                </button>
            </nav>

            <main className="glass-panel">
                {activeTab === 'chronology' && renderChronology()}
                {activeTab === 'consultations' && renderConsultations()}
                {activeTab === 'hospitalizations' && renderHospitalizations()}
                {activeTab === 'labs' && (
                    <div className="tab-content">
                        {history.labResults?.length > 0 ? (
                            <table className="labs-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Examen</th>
                                        <th>Resultado</th>
                                        <th>Estado</th>
                                        <th>Adjunto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.labResults.map((lab: any) => (
                                        <tr key={lab.id}>
                                            <td>{new Date(lab.performedAt || lab.date).toLocaleDateString()}</td>
                                            <td>{lab.testName}</td>
                                            <td>{lab.value} {lab.unit}</td>
                                            <td>
                                                <span className={`badge ${lab.status === 'Normal' ? 'normal' : 'abnormal'}`}>
                                                    {lab.status}
                                                </span>
                                            </td>
                                            <td>
                                                {lab.fileUrl && (
                                                    <a href={lab.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                                                        📄 Ver Archivo
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <div className="no-data">No hay resultados de laboratorio.</div>}
                    </div>
                )}
                {activeTab === 'images' && (
                    <div className="tab-content">
                        {history.diagnosticImages?.length > 0 ? (
                            <div className="images-grid">
                                {history.diagnosticImages.map((img: any) => (
                                    <div key={img.id} className="image-card">
                                        <div className="image-preview">
                                            <a href={img.imageUrl} target="_blank" rel="noopener noreferrer">
                                                <img src={img.imageUrl} alt={img.imageType} />
                                            </a>
                                        </div>
                                        <div className="image-info">
                                            <span className="image-date">{new Date(img.performedAt).toLocaleDateString()}</span>
                                            <h4>{img.imageType}</h4>
                                            <p>{img.report}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : <div className="no-data">No hay imágenes diagnósticas justificadas.</div>}
                    </div>
                )}
                {activeTab === 'scans' && (
                    <div className="tab-content">
                        {history.machineScans?.length > 0 ? (
                            <table className="labs-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Equipo</th>
                                        <th>Interpretación</th>
                                        <th>Archivo Raw</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.machineScans.map((scan: any) => (
                                        <tr key={scan.id}>
                                            <td>{new Date(scan.performedAt).toLocaleDateString()}</td>
                                            <td>{scan.machineType}</td>
                                            <td>{scan.interpretation}</td>
                                            <td>
                                                {scan.rawOutputUrl && (
                                                    <a href={scan.rawOutputUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                                                        📊 Descargar Raw
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <div className="no-data">No hay escaneos de equipo registrados.</div>}
                    </div>
                )}
                {activeTab === 'billing' && (
                    <div className="tab-content">
                        {invoices.length > 0 ? (
                            <table className="labs-table">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>No. Factura</th>
                                        <th>Pagador</th>
                                        <th>Total</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((inv: any) => (
                                        <tr key={inv.id}>
                                            <td>{inv.date}</td>
                                            <td>{inv.invoiceNumber}</td>
                                            <td>{inv.payerName}</td>
                                            <td>${inv.total.toLocaleString()}</td>
                                            <td>
                                                <span className={`badge ${inv.status.toLowerCase()}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/billing/invoices/${inv.id}`} className="view-btn">
                                                    Ver Factura
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="no-data">No hay facturas registradas para este paciente.</div>
                        )}
                    </div>
                )}
            </main>

            <style jsx>{`
                .history-container {
                    padding: 2rem;
                    max-width: 1300px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .patient-info-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }

                .patient-id-badge {
                    background: #e2e8f0;
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #475569;
                }

                .header-actions {
                    display: flex;
                    gap: 1rem;
                }

                .btn-primary, .btn-secondary {
                    padding: 0.75rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    transition: all 0.2s;
                    font-size: 0.9rem;
                }

                .btn-primary { background: #007acc; color: white; }
                .btn-secondary { background: #f1f5f9; color: #007acc; border: 1px solid #e2e8f0; }

                .history-tabs {
                    display: flex;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                    padding-bottom: 0.5rem;
                }

                .history-tabs button {
                    padding: 0.875rem 1.5rem;
                    border: none;
                    background: white;
                    border-radius: 14px;
                    cursor: pointer;
                    font-weight: 600;
                    color: #64748b;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    border: 1px solid #e2e8f0;
                }

                .history-tabs button.active {
                    background: #007acc;
                    color: white;
                    border-color: #007acc;
                    box-shadow: 0 4px 12px rgba(0, 122, 204, 0.2);
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    padding: 2.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.04);
                    min-height: 500px;
                }

                /* Timeline Styles */
                .timeline {
                    position: relative;
                    padding-left: 2rem;
                }

                .timeline::before {
                    content: '';
                    position: absolute;
                    left: 0.5rem;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: #e2e8f0;
                }

                .timeline-item {
                    position: relative;
                    margin-bottom: 3rem;
                }

                .timeline-marker {
                    position: absolute;
                    left: -2rem;
                    top: 0.5rem;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: white;
                    border: 3px solid #007acc;
                    z-index: 2;
                }

                .timeline-item.hospitalization .timeline-marker { border-color: #0ea5e9; }
                .timeline-item.consultation .timeline-marker { border-color: #8b5cf6; }

                .timeline-content {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #f1f5f9;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }

                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }

                .event-type-badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .event-type-badge.hospitalization { background: #e0f2fe; color: #0369a1; }
                .event-type-badge.consultation { background: #ede9fe; color: #5b21b6; }

                .event-date { font-size: 0.85rem; color: #64748b; font-weight: 600; }

                .event-meta {
                    display: flex;
                    gap: 1.5rem;
                    margin-top: 1rem;
                    padding-top: 1rem;
                    border-top: 1px dashed #e2e8f0;
                    font-size: 0.9rem;
                    align-items: center;
                }

                .status-badge {
                    padding: 0.2rem 0.6rem;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }

                .status-badge.active { background: #dcfce7; color: #166534; }
                .status-badge.discharged { background: #f1f5f9; color: #475569; }

                .mini-evolutions {
                    margin-top: 1rem;
                    background: #f8fafc;
                    padding: 1rem;
                    border-radius: 12px;
                }

                .mini-evo {
                    display: flex;
                    gap: 1rem;
                    padding: 0.5rem 0;
                    font-size: 0.85rem;
                    border-bottom: 1px dashed #e2e8f0;
                }

                .mini-evo:last-child { border: none; }
                .mini-date { font-weight: 700; color: #007acc; white-space: nowrap; }

                .event-actions {
                    margin-top: 1rem;
                    display: flex;
                    gap: 1rem;
                }

                .action-link {
                    background: #f0f9ff;
                    color: #0369a1;
                    border: none;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    font-weight: 700;
                    cursor: pointer;
                }

                .action-link.discharge { background: #fee2e2; color: #b91c1c; }

                .view-more-btn {
                    margin-top: 1rem;
                    background: none;
                    border: 1px solid #cbd5e1;
                    padding: 0.5rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    color: #64748b;
                    cursor: pointer;
                }

                .file-link {
                    color: #007acc;
                    font-weight: 700;
                    text-decoration: none;
                    font-size: 0.85rem;
                }

                .images-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .image-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.02);
                }

                .image-preview img {
                    width: 100%;
                    height: 180px;
                    object-fit: cover;
                }

                .image-info {
                    padding: 1.25rem;
                }

                .image-date {
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 600;
                }

                .image-info h4 {
                    margin: 0.5rem 0;
                    color: #2d3436;
                }

                .image-info p {
                    font-size: 0.85rem;
                    color: #636e72;
                    line-height: 1.4;
                }

                /* Legacy content styles */
                .consultation-card {
                    border-left: 4px solid #007acc;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 0 12px 12px 0;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .hosp-card {
                    border: 1px solid #e2e8f0;
                    background: white;
                    padding: 1.5rem;
                    border-radius: 12px;
                    margin-bottom: 1.5rem;
                }
                .hosp-card.active { border-left: 6px solid #10b981; }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    color: #64748b;
                }

                .loader {
                    border: 5px solid #f3f3f3;
                    border-top: 5px solid #007acc;
                    border-radius: 50%;
                    width: 50px;
                    height: 50px;
                    animation: spin 1s linear infinite;
                    margin-bottom: 1rem;
                }

                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
