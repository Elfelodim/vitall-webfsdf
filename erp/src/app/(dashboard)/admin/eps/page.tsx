'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function InsurersPage() {
    const [insurers, setInsurers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/insurers')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setInsurers(data); })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Administrador EPS/Aseguradoras</h1>
                    <p className="text-slate-500">Gestión de entidades responsables</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/eps/import" className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700">
                        📤 Importar Masivo
                    </Link>
                    <Link href="/admin/eps/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
                        + Nueva EPS
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-bold text-slate-600">Código</th>
                            <th className="p-4 text-sm font-bold text-slate-600">NIT</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Razón Social</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Régimen</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {insurers.map(eps => (
                            <tr key={eps.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-sm">{eps.code}</td>
                                <td className="p-4 font-mono text-sm">{eps.nit}</td>
                                <td className="p-4 font-bold text-slate-700">{eps.name}</td>
                                <td className="p-4 text-sm">{eps.regime}</td>
                                <td className="p-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Activo</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {insurers.length === 0 && !loading && (
                    <div className="p-8 text-center text-slate-400">No hay aseguradoras registradas.</div>
                )}
            </div>
        </div>
    );
}
