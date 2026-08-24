'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();

    const modules = [
        {
            name: 'Clínica',
            description: 'Historia clínica, consultas y hospitalización',
            icon: '🩺',
            path: '/clinical',
            color: '#007acc',
            roles: ['Admin', 'Doctor', 'Nurse']
        },
        {
            name: 'Pacientes',
            description: 'Gestión de pacientes y registros',
            icon: '👤',
            path: '/patients',
            color: '#00b894',
            roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist']
        },
        {
            name: 'Agenda',
            description: 'Citas, cirugías y programación',
            icon: '📅',
            path: '/scheduling',
            color: '#6c5ce7',
            roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist']
        },
        {
            name: 'Facturación',
            description: 'Facturas, RIPS y cobros',
            icon: '📄',
            path: '/billing',
            color: '#fdcb6e',
            roles: ['Admin', 'Receptionist']
        },
        {
            name: 'Contabilidad',
            description: 'PUC, nómina y reportes financieros',
            icon: '💰',
            path: '/accounting',
            color: '#00b894',
            roles: ['Admin']
        },
        {
            name: 'Inventario',
            description: 'Medicamentos y dispositivos médicos',
            icon: '📦',
            path: '/inventory',
            color: '#fd79a8',
            roles: ['Admin', 'Nurse']
        }
    ];

    const userRole = session?.user?.role || 'User';
    const visibleModules = modules.filter(module =>
        module.roles.includes(userRole) || module.roles.includes('All')
    );

    const stats = [
        { label: 'Pacientes Activos', value: '1,234', icon: '👥', color: '#007acc' },
        { label: 'Citas Hoy', value: '42', icon: '📅', color: '#6c5ce7' },
        { label: 'Facturas Pendientes', value: '18', icon: '📄', color: '#fdcb6e' },
        { label: 'Inventario Crítico', value: '5', icon: '⚠️', color: '#d63031' }
    ];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Bienvenido, {session?.user?.name || 'Usuario'}</h1>
                    <p className="subtitle">Panel de Control - ANTINEO IPS</p>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="stat-card glass-panel">
                        <div className="stat-icon" style={{ color: stat.color }}>
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Module Launcher */}
            <section className="module-launcher">
                <h2>Módulos del Sistema</h2>
                <div className="modules-grid">
                    {visibleModules.map((module) => (
                        <div
                            key={module.path}
                            className="module-card glass-panel"
                            onClick={() => router.push(module.path)}
                            style={{ '--module-color': module.color } as React.CSSProperties}
                        >
                            <div className="module-icon">{module.icon}</div>
                            <h3>{module.name}</h3>
                            <p>{module.description}</p>
                            <div className="module-arrow">→</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Recent Activity */}
            <section className="recent-activity">
                <div className="glass-panel">
                    <h3>Actividad Reciente</h3>
                    <ul className="activity-list">
                        <li>
                            <span className="activity-time">09:15 AM</span>
                            <span>Nueva consulta registrada - Paciente #1234</span>
                        </li>
                        <li>
                            <span className="activity-time">08:45 AM</span>
                            <span>Factura #F-2023001 Generada</span>
                        </li>
                        <li>
                            <span className="activity-time">08:30 AM</span>
                            <span>Turno Enfermería - Inicio</span>
                        </li>
                    </ul>
                </div>
            </section>

            <style jsx>{`
                .dashboard-container {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .dashboard-header {
                    margin-bottom: 2rem;
                }

                .dashboard-header h1 {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .subtitle {
                    color: #718096;
                    font-size: 1rem;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 3rem;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                    padding: 1.5rem;
                }

                .stat-icon {
                    font-size: 2.5rem;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2d3748;
                }

                .stat-label {
                    color: #718096;
                    font-size: 0.9rem;
                    margin-top: 0.25rem;
                }

                .module-launcher {
                    margin-bottom: 3rem;
                }

                .module-launcher h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 1.5rem;
                }

                .modules-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 1.5rem;
                }

                .module-card {
                    padding: 2rem;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .module-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: var(--module-color);
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .module-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                }

                .module-card:hover::before {
                    opacity: 1;
                }

                .module-icon {
                    font-size: 3rem;
                    margin-bottom: 1rem;
                }

                .module-card h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .module-card p {
                    color: #718096;
                    font-size: 0.9rem;
                    line-height: 1.5;
                }

                .module-arrow {
                    position: absolute;
                    bottom: 1.5rem;
                    right: 1.5rem;
                    font-size: 1.5rem;
                    color: var(--module-color);
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s;
                }

                .module-card:hover .module-arrow {
                    opacity: 1;
                    transform: translateX(0);
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                }

                .recent-activity {
                    margin-bottom: 2rem;
                }

                .recent-activity .glass-panel {
                    padding: 2rem;
                }

                .recent-activity h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #2d3748;
                    margin-bottom: 1.5rem;
                }

                .activity-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .activity-list li {
                    padding: 1rem 0;
                    border-bottom: 1px solid #e2e8f0;
                    display: flex;
                    gap: 1rem;
                }

                .activity-list li:last-child {
                    border-bottom: none;
                }

                .activity-time {
                    font-weight: 600;
                    color: #007acc;
                    min-width: 80px;
                }
            `}</style>
        </div>
    );
}
