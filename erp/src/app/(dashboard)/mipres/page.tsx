'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MipresDashboard() {
    // Mock data for display
    const [prescriptions] = useState([
        { id: '2026109283', date: '2026-01-07', patient: 'Juan Perez', tech: 'Pembrolizumab', status: 'Activa' },
        { id: '2026109284', date: '2026-01-06', patient: 'Maria Rodriguez', tech: 'PET CT', status: 'Dispensada' },
        { id: '2026109285', date: '2026-01-05', patient: 'Carlos Ruiz', tech: 'Bevacizumab', status: 'Anulada' },
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Tablero MIPRES (No PBS) 🇨🇴</h1>
                    <p className="text-slate-500 mt-1">Gestión centralizada de prescripciones y tutelas</p>
                </div>
                <Link
                    href="/patients"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                >
                    <span>⚡ Nueva Prescripción</span>
                </Link>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Prescripciones Hoy</h3>
                    <p className="text-4xl font-bold text-purple-600 mt-2">12</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Pendientes de Junta</h3>
                    <p className="text-4xl font-bold text-orange-500 mt-2">3</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-semibold uppercase">Direccionamientos</h3>
                    <p className="text-4xl font-bold text-blue-500 mt-2">85%</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-700">Últimos Movimientos</h2>
                </div>
                <table className="w-full">
                    <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-6 py-4 text-left">No. Prescripción</th>
                            <th className="px-6 py-4 text-left">Fecha</th>
                            <th className="px-6 py-4 text-left">Paciente</th>
                            <th className="px-6 py-4 text-left">Tecnología</th>
                            <th className="px-6 py-4 text-left">Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {prescriptions.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-600">{p.id}</td>
                                <td className="px-6 py-4 text-slate-600">{p.date}</td>
                                <td className="px-6 py-4 font-semibold text-slate-700">{p.patient}</td>
                                <td className="px-6 py-4 text-purple-600 font-medium">{p.tech}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.status === 'Activa' ? 'bg-green-100 text-green-700' :
                                            p.status === 'Dispensada' ? 'bg-blue-100 text-blue-700' :
                                                'bg-red-100 text-red-700'
                                        }`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-purple-600 font-medium text-sm">Ver Detalle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
