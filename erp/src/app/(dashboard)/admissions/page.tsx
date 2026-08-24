'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdmissionsDashboard() {
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admissions?limit=50');
            if (res.ok) {
                setOrders(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container glass-panel">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Admisiones</h1>
                    <p className="page-subtitle">Órdenes de Servicio y Recepción de Pacientes</p>
                </div>
                <button
                    onClick={() => router.push('/admissions/new')}
                    className="btn-primary"
                >
                    + Nueva Orden de Servicio
                </button>
            </header>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">{orders.length}</span>
                    <span className="stat-label">Órdenes Hoy</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">
                        {orders.filter(o => o.status === 'Open').length}
                    </span>
                    <span className="stat-label">Abiertas</span>
                </div>
            </div>

            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Consecutivo</th>
                            <th>Fecha</th>
                            <th>Paciente</th>
                            <th>Documento</th>
                            <th>Contrato</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="text-center p-4">Cargando...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center p-4">No hay órdenes registradas.</td></tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td className="font-mono font-bold">{order.consecutive}</td>
                                    <td>{new Date(order.admissionDate).toLocaleString()}</td>
                                    <td>{order.patient.firstName} {order.patient.lastName}</td>
                                    <td>{order.patient.documentNumber}</td>
                                    <td>{order.contractType || '-'}</td>
                                    <td>
                                        <span className={`badge ${order.status === 'Open' ? 'success' : 'gray'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn-sm"
                                            onClick={() => router.push(`/admissions/${order.id}`)}
                                        >
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    min-height: 80vh;
                    font-family: 'Inter', sans-serif;
                }
                .glass-panel {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                    border: 1px solid rgba(255,255,255,0.5);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.05);
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                }
                .page-subtitle {
                    color: #64748b;
                    font-size: 0.95rem;
                }
                .btn-primary {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
                }
                .btn-primary:hover {
                    background: #1d4ed8;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
                }
                .stats-row {
                    display: flex;
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: white;
                    padding: 1.5rem;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    min-width: 150px;
                }
                .stat-value {
                    display: block;
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2563eb;
                }
                .stat-label {
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 600;
                }
                .table-container {
                    overflow-x: auto;
                    background: white;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                }
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .data-table th {
                    background: #f8fafc;
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .data-table td {
                    padding: 1rem;
                    border-bottom: 1px solid #f1f5f9;
                    color: #334155;
                    font-size: 0.95rem;
                }
                .font-mono { font-family: monospace; }
                .badge {
                    padding: 0.25rem 0.75rem;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .badge.success { background: #dcfce7; color: #166534; }
                .badge.gray { background: #f1f5f9; color: #475569; }
                .btn-sm {
                    padding: 0.4rem 0.8rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.85rem;
                }
                .btn-sm:hover { background: #f8fafc; }
            `}</style>
        </div>
    );
}
