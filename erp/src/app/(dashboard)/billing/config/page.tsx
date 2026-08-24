'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingConfigPage() {
    const router = useRouter();
    const [resolutions, setResolutions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({
        resolutionNumber: '',
        prefix: '',
        fromNumber: '',
        toNumber: '',
        startDate: '',
        endDate: '',
        technicalKey: ''
    });

    useEffect(() => {
        fetchResolutions();
    }, []);

    const fetchResolutions = async () => {
        try {
            const res = await fetch('/api/billing/resolution');
            if (res.ok) setResolutions(await res.json());
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/billing/resolution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert('Resolución Registrada Correctamente');
                setForm({
                    resolutionNumber: '', prefix: '', fromNumber: '', toNumber: '', startDate: '', endDate: '', technicalKey: ''
                });
                fetchResolutions();
            } else {
                alert('Error al registrar');
            }
        } catch (error) {
            alert('Error de conexión');
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Configuración DIAN</h1>
            <p className="text-slate-500 mb-8">Gestión de Resoluciones de Facturación Electrónica</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-[#005f99] mb-4">Nueva Resolución</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Número Resolución DIAN</label>
                            <input
                                className="w-full p-2 border rounded-lg"
                                required
                                value={form.resolutionNumber}
                                onChange={e => setForm({ ...form, resolutionNumber: e.target.value })}
                                placeholder="Ej: 18760000001"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Prefijo</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={form.prefix}
                                    onChange={e => setForm({ ...form, prefix: e.target.value })}
                                    placeholder="Ej: SETT"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Desde</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={form.fromNumber}
                                    onChange={e => setForm({ ...form, fromNumber: e.target.value })}
                                    placeholder="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Hasta</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={form.toNumber}
                                    onChange={e => setForm({ ...form, toNumber: e.target.value })}
                                    placeholder="1000"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Inicio</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={form.startDate}
                                    onChange={e => setForm({ ...form, startDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha Fin</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded-lg"
                                    required
                                    value={form.endDate}
                                    onChange={e => setForm({ ...form, endDate: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Clave Técnica</label>
                            <input
                                className="w-full p-2 border rounded-lg bg-slate-50 font-mono text-xs"
                                required
                                value={form.technicalKey}
                                onChange={e => setForm({ ...form, technicalKey: e.target.value })}
                                placeholder="fc8eac422eba16e22..."
                            />
                        </div>
                        <button className="bg-[#005f99] text-white py-3 rounded-xl font-bold hover:bg-[#004e80] transition mt-2">
                            Guardar Resolución
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-700">Historial de Resoluciones</h2>
                    {loading ? <p>Cargando...</p> : resolutions.length === 0 ? <p className="text-slate-400">No hay resoluciones registradas.</p> : (
                        resolutions.map(res => (
                            <div key={res.id} className={`p-4 rounded-xl border ${res.status === 'Active' ? 'bg-green-50 border-green-200' : 'bg-slate-50'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800">{res.prefix} {res.fromNumber} - {res.toNumber}</h3>
                                        <p className="text-xs text-slate-500">Res: {res.resolutionNumber}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${res.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {res.status}
                                    </span>
                                </div>
                                <div className="text-sm text-slate-600">
                                    <p>Actual: <strong>{res.currentNumber}</strong></p>
                                    <p>Vence: {new Date(res.endDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
