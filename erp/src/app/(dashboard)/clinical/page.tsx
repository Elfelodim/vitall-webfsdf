'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PatientList from '@/components/clinical/PatientList';

export default function ClinicalPage() {
    const router = useRouter();
    const [searchPatient, setSearchPatient] = useState('');

    const handleHistoryAccess = () => {
        if (searchPatient.trim()) {
            router.push(`/dashboard/clinical-history/${searchPatient}`);
        } else {
            alert('Por favor ingresa el ID del paciente para continuar');
        }
    };

    const quickActions = [
        {
            title: 'Historia Clínica',
            description: 'Acceso a historias clínicas de pacientes',
            icon: '📋',
            color: '#007acc',
            action: 'history',
        },
        {
            title: 'Nueva Consulta',
            description: 'Registrar consulta externa',
            icon: '🩺',
            color: '#00b894',
            action: 'consultation',
        },
        {
            title: 'Nueva Hospitalización',
            description: 'Registrar ingreso hospitalario',
            icon: '🏥',
            color: '#6c5ce7',
            action: 'admission',
        },
        {
            title: 'Laboratorios',
            description: 'Registrar resultado de laboratorio',
            icon: '🧪',
            color: '#00b894',
            action: 'lab',
        },
        {
            title: 'Imágenes',
            description: 'Registrar imagen diagnóstica',
            icon: '🖼️',
            color: '#fd79a8',
            action: 'image',
        },
        {
            title: 'Escaneos',
            description: 'Registrar escaneo de máquina',
            icon: '📠',
            color: '#a29bfe',
            action: 'scan',
        },
        {
            title: 'Cirugías',
            description: 'Programación quirúrgica',
            icon: '⚕️',
            color: '#fdcb6e',
            path: '/clinical/surgery'
        },
        {
            title: 'Informe Quirúrgico',
            description: 'Crear reporte de cirugía',
            icon: '🔪',
            color: '#ff7675',
            action: 'surgery-report',
        },
        {
            title: 'Anestesia',
            description: 'Registro de anestesia',
            icon: '💉',
            color: '#74b9ff',
            action: 'anesthesia-record',
        }
    ];

    const handleAction = (action: string) => {
        if (!searchPatient.trim()) {
            alert('⚠️ Por favor ingresa el ID del paciente en la barra superior para continuar.');
            // Focus on input could be added here for better UX
            const input = document.getElementById('global-patient-search');
            if (input) input.focus();
            return;
        }

        switch (action) {
            case 'history':
                router.push(`/dashboard/clinical-history/${searchPatient}`);
                break;
            case 'consultation':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/consultation`);
                break;
            case 'admission':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/admission`);
                break;
            case 'lab':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/lab-result`);
                break;
            case 'image':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/image`);
                break;
            case 'scan':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/scan`);
                break;
            case 'surgery-report':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/surgery`);
                break;
            case 'anesthesia-record':
                router.push(`/dashboard/clinical-history/${searchPatient}/new/anesthesia`);
                break;
        }
    };

    return (
        <div className="clinical-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión Clínica</h1>
                    <p className="page-subtitle">Administración de pacientes e historias clínicas.</p>
                </div>

                {/* Global Patient Search Bar */}
                <div className="patient-search-bar glass-panel">
                    <label htmlFor="global-patient-search">Paciente Activo:</label>
                    <div className="search-input-wrapper">
                        <input
                            id="global-patient-search"
                            type="text"
                            placeholder="Ingrese ID o Documento del Paciente..."
                            value={searchPatient}
                            onChange={(e) => setSearchPatient(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleHistoryAccess()}
                        />
                        <button onClick={handleHistoryAccess} className="go-btn" title="Ir a Historia Clínica">
                            →
                        </button>
                    </div>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">1,240</span>
                    <span className="stat-label">Pacientes Activos</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">56</span>
                    <span className="stat-label">Ingresos Hoy</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">98%</span>
                    <span className="stat-label">Disponibilidad Camas</span>
                </div>
            </div>

            {/* Quick Actions Section */}
            <section className="quick-actions-section">
                <h2>Accesos Rápidos</h2>
                <div className="actions-grid">
                    {quickActions.map((action, index) => (
                        <div
                            key={index}
                            className="action-card glass-panel"
                            style={{ '--action-color': action.color } as React.CSSProperties}
                            onClick={() => action.path ? router.push(action.path) : handleAction(action.action!)}
                        >
                            <div className="action-icon">{action.icon}</div>
                            <h3>{action.title}</h3>
                            <p>{action.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="section">
                <PatientList />
            </div>

            <style jsx>{`
                .clinical-page {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                    /* Removed overflow and fixed height to allow natural scrolling */
                }

                .page-header {
                    margin-bottom: 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .page-subtitle {
                    color: #718096;
                    font-size: 1rem;
                }

                .patient-search-bar {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.75rem 1.5rem;
                    min-width: 400px;
                }

                .patient-search-bar label {
                    font-weight: 700;
                    color: #2d3748;
                    white-space: nowrap;
                }

                .search-input-wrapper {
                    display: flex;
                    flex: 1;
                    gap: 0.5rem;
                }

                .search-input-wrapper input {
                    flex: 1;
                    padding: 0.5rem 1rem;
                    border: 2px solid #e2e8f0;
                    border-radius: 8px;
                    font-size: 1rem;
                    transition: all 0.2s;
                }

                 .search-input-wrapper input:focus {
                    outline: none;
                    border-color: #007acc;
                    background: white;
                 }

                .go-btn {
                    padding: 0.5rem 1rem;
                    background: #007acc;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.2rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .go-btn:hover {
                    background: #005f99;
                    transform: translateX(2px);
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 16px;
                    padding: 1.5rem;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #007acc;
                }

                .stat-label {
                    color: #718096;
                    font-size: 0.9rem;
                }

                .quick-actions-section {
                    margin-bottom: 3rem;
                }

                .quick-actions-section h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 1.5rem;
                }

                .actions-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }

                .action-card {
                    padding: 2rem;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    height: 100%;
                }

                .action-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--action-color);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .action-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }

                .action-card:hover::before {
                    opacity: 1;
                }

                .action-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                .action-card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .action-card p {
                    color: #718096;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                }

                .section {
                    margin-top: 2rem;
                }
            `}</style>
        </div>
    );
}
