'use client';

import { useState, useEffect } from 'react';

export default function RipsGeneratorPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch Issued invoices (regardless of submission status, or maybe allow re-generating)
        fetch('/api/billing/invoices?status=Issued')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setInvoices(data); })
            .finally(() => setLoading(false));
    }, []);

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
        else setSelected([...selected, id]);
    };

    const handleGenerate = async () => {
        if (selected.length === 0) return;

        try {
            const res = await fetch('/api/billing/rips/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ invoiceIds: selected })
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `RIPS_GENERADO_${new Date().getTime()}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
            } else {
                alert('Error al generar RIPS');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Generador RIPS (Res. 2275)</h1>
            <p className="text-slate-500 mb-6">Seleccione las facturas para las cuales desea generar el archivo JSON de Validación.</p>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <span className="font-bold text-slate-700">{selected.length} Facturas Seleccionadas</span>
                    <button
                        onClick={handleGenerate}
                        disabled={selected.length === 0}
                        className={`px-6 py-2 rounded-lg font-bold ${selected.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
                    >
                        ⚡ Generar JSON
                    </button>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 w-10"><input type="checkbox" /></th>
                            <th className="p-4 text-sm font-bold text-slate-600">No. Factura</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Entidad</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Paciente</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Fecha</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? <tr><td colSpan={6} className="p-8 text-center">Cargando...</td></tr> : invoices.map(inv => (
                            <tr key={inv.id} className="hover:bg-slate-50">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selected.includes(inv.id)}
                                        onChange={() => toggleSelect(inv.id)}
                                        className="w-5 h-5 text-indigo-600 rounded"
                                    />
                                </td>
                                <td className="p-4 font-bold text-slate-700">{inv.invoiceNumber}</td>
                                <td className="p-4 text-sm text-slate-600">{inv.serviceOrder?.contract?.insurer?.name || 'Particular'}</td>
                                <td className="p-4 text-sm font-bold">{inv.patientName || `${inv.patient?.firstName} ${inv.patient?.lastName}`}</td>
                                <td className="p-4 text-sm text-slate-500">{new Date(inv.date).toLocaleDateString()}</td>
                                <td className="p-4 font-bold text-slate-800">$ {inv.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {invoices.length === 0 && !loading && (
                    <div className="p-12 text-center text-slate-400">No hay facturas disponibles para RIPS</div>
                )}
            </div>
        </div>
    );
}
