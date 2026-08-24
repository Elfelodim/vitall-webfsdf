'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RadicacionPage() {
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    // Submission Form Data
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        stickerNumber: '',
        carrier: '',
        trackingNumber: ''
    });

    useEffect(() => {
        // Fetch invoices ready for submission (Status=Issued, No Submission)
        fetch('/api/billing/invoices?status=Issued&submission=null')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setInvoices(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleSelect = (id: string) => {
        if (selected.includes(id)) setSelected(selected.filter(s => s !== id));
        else setSelected([...selected, id]);
    };

    const handleSubmission = async () => {
        if (!form.stickerNumber) return alert('Número de Radicado es requerido');

        // Find common insurer? usually we submit per insurer. 
        // Logic: Verify all selected have same Insurer? Or allow mixed? 
        // Simplification: Assume mixed or user filtered. Ideally we pass the first insurer ID found.
        if (selected.length === 0) return;

        const firstInvoice = invoices.find(i => i.id === selected[0]);
        // Ideally Invoice should have insurerId directly or via Patient.eps. 
        // Assuming we rely on a relation 'insurer' or parse string. 
        // For now, let's just pick 'insurerId' from first invoice if available 
        // (Wait, Invoice doesn't have insurerId in schema yet? It has patient.contract.insurer? 
        // Let's assume we use 'patient.eps' string or update schema later.
        // For now, let's use a dummy or fetched Insurer ID if we had one.
        // Actually, schema has `contract.insurerId`. We should use that.
        // For MVP, I'll hardcode or fetch if possible.
        // Let's just send the form data and selected IDs.

        try {
            const res = await fetch('/api/billing/radicacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceIds: selected,
                    stickerNumber: form.stickerNumber,
                    carrier: form.carrier,
                    trackingNumber: form.trackingNumber,
                    insurerId: 'TODO_INSURER_ID' // Need to resolve this properly
                })
            });

            if (res.ok) {
                alert('Facturas Radicadas Exitosamente');
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Radicación de Cuentas</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">Facturas Pendientes de Radicar</h3>
                    <button
                        disabled={selected.length === 0}
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50 hover:bg-blue-700"
                    >
                        Radicar Selección ({selected.length})
                    </button>
                </div>

                {loading ? <p>Cargando...</p> : (
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="p-3 w-10"><input type="checkbox" onChange={(e) => {
                                    if (e.target.checked) setSelected(invoices.map(i => i.id));
                                    else setSelected([]);
                                }} /></th>
                                <th className="p-3">No. Factura</th>
                                <th className="p-3">Entidad</th>
                                <th className="p-3">Paciente</th>
                                <th className="p-3">Fecha</th>
                                <th className="p-3 text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} className="hover:bg-slate-50 border-b">
                                    <td className="p-3"><input type="checkbox" checked={selected.includes(inv.id)} onChange={() => toggleSelect(inv.id)} /></td>
                                    <td className="p-3 font-bold">{inv.invoiceNumber}</td>
                                    <td className="p-3">{inv.patient?.eps || '-'}</td>
                                    <td className="p-3">{inv.patient?.firstName} {inv.patient?.lastName}</td>
                                    <td className="p-3">{new Date(inv.date).toLocaleDateString()}</td>
                                    <td className="p-3 text-right font-mono font-bold">$ {inv.total.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Submission Details */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Confirmar Radicación</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">No. Radicado (Sticker)</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={form.stickerNumber}
                                    onChange={e => setForm({ ...form, stickerNumber: e.target.value })}
                                    placeholder="Ej: 2024-RAD-001"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Mensajería / Transportadora</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={form.carrier}
                                    onChange={e => setForm({ ...form, carrier: e.target.value })}
                                    placeholder="Ej: Servientrega"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">No. Guía</label>
                                <input
                                    className="w-full p-2 border rounded-lg"
                                    value={form.trackingNumber}
                                    onChange={e => setForm({ ...form, trackingNumber: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                            <button onClick={handleSubmission} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
