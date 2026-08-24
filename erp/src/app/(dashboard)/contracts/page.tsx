'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ContractsPage() {
    const [contracts, setContracts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/contracts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setContracts(data);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Contratación</h1>
                    <p className="text-slate-500">Gestión de Contratos y Tarifarios</p>
                </div>
                <Link href="/contracts/new" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/20">
                    + Nuevo Contrato
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-12 text-slate-400">Cargando contratos...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contracts.map(contract => (
                        <Link href={`/contracts/${contract.id}`} key={contract.id} className="block group">
                            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-blue-50 p-3 rounded-xl text-2xl group-hover:scale-110 transition">
                                        📄
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${contract.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {contract.status === 'Active' ? 'Activo' : 'Inactivo'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-800 mb-1">{contract.clientName}</h3>
                                <p className="text-sm text-slate-500 mb-4 font-mono">{contract.nit}</p>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">Manual Base</span>
                                        <span className="font-bold text-slate-700">{contract.manualType}</span>
                                    </div>
                                    <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                                        <span className="text-slate-500">Ajuste</span>
                                        <span className={`font-bold ${contract.adjustmentPercentage >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {contract.adjustmentPercentage > 0 ? '+' : ''}{contract.adjustmentPercentage}%
                                        </span>
                                    </div>
                                    {contract.budgetCap && (
                                        <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                                            <span className="text-slate-500">Techo ({contract.capPeriod})</span>
                                            <span className="font-bold text-blue-600">$ {contract.budgetCap.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                    {contracts.length === 0 && (
                        <div className="col-span-full text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                            No hay contratos registrados. Crea uno nuevo para comenzar.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
