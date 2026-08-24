'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CreditNotesPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Create Note Form (simplified)
    const [form, setForm] = useState({ invoiceNumber: '', value: 0, reason: '' });

    useEffect(() => {
        fetch('/api/billing/credit-notes')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setNotes(data); })
            .finally(() => setLoading(false));
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/billing/credit-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert('Nota Crédito Creada');
                window.location.reload();
            } else {
                alert('Error al crear nota');
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Notas Crédito y Devoluciones</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700"
                >
                    + Nueva Nota Crédito
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-bold text-slate-600">No. Nota</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Factura Afectada</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Motivo</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Valor</th>
                            <th className="p-4 text-sm font-bold text-slate-600">Estado DIAN</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {notes.map(note => (
                            <tr key={note.id} className="hover:bg-slate-50">
                                <td className="p-4 font-mono text-sm font-bold text-purple-700">{note.number}</td>
                                <td className="p-4">{note.invoice?.invoiceNumber}</td>
                                <td className="p-4 text-slate-600">{note.reason}</td>
                                <td className="p-4 font-bold">$ {note.value.toLocaleString()}</td>
                                <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold">{note.dianStatus}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {notes.length === 0 && !loading && <div className="p-8 text-center text-slate-400">No hay notas crédito registradas.</div>}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                        <h2 className="text-xl font-bold mb-4">Nueva Nota Crédito</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">Número de Factura</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={form.invoiceNumber}
                                    onChange={e => setForm({ ...form, invoiceNumber: e.target.value })}
                                    placeholder="FE-..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Valor a Acreditar</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={form.value}
                                    onChange={e => setForm({ ...form, value: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Motivo / Justificación</label>
                                <textarea
                                    className="w-full p-2 border rounded h-24"
                                    value={form.reason}
                                    onChange={e => setForm({ ...form, reason: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancelar</button>
                            <button onClick={handleCreate} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700">Crear</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
