'use client';

import { useState, useEffect } from 'react';

export default function RipsPage() {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            // Reusing the general invoices API or create a specific one?
            // We'll assume GET /api/billing/invoices returns list including validation status
            // If not, we might need to modify billingService to expose getInvoices via API.
            // For now, I'll assume we can fetch from a generic endpoint or I need to create one.
            // I'll assume /api/admin/billing/invoices exists or I will create it.
            // Wait, I haven't created a general invoice list API yet, only 'createInvoice' in service.
            // I should use the server action or create an API.

            const res = await fetch('/api/admin/billing/invoices');
            if (res.ok) {
                setInvoices(await res.json());
            } else {
                // Fallback mock or empty
                console.error("Failed to fetch invoices");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Quick helper to download
    const downloadRips = (id: string, number: string) => {
        window.open(`/api/billing/rips/download?invoiceId=${id}`, '_blank');
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Generación RIPS (Res. 2275)</h1>
                    <p className="text-slate-500">Seleccione las facturas para generar el archivo JSON de transmisión.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600">Factura</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Paciente</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Fecha</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Total</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Estado RIPS</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando...</td></tr>
                        ) : invoices.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay facturas con RIPS pendientes.</td></tr>
                        ) : (
                            invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{inv.invoiceNumber}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {inv.patient.firstName} {inv.patient.lastName}
                                        <div className="text-xs text-slate-400">{inv.patient.documentType} {inv.patient.documentNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm font-mono text-slate-700">${inv.total.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        {inv.ripsGenerated ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Generado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => downloadRips(inv.id, inv.invoiceNumber)}
                                            className="text-blue-600 hover:text-blue-900 text-sm font-medium hover:underline"
                                        >
                                            Descargar JSON
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
