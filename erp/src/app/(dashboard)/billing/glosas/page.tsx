'use client';

import { useState, useEffect } from 'react';

export default function GlosasPage() {
    const [glosas, setGlosas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGlosa, setSelectedGlosa] = useState<any>(null);
    const [responseForm, setResponseForm] = useState({ action: 'Refute', notes: '', acceptedValue: 0 });

    // New Glosa State
    const [showNewModal, setShowNewModal] = useState(false);
    const [searchInvoice, setSearchInvoice] = useState('');
    const [foundInvoice, setFoundInvoice] = useState<any>(null);
    const [newGlosa, setNewGlosa] = useState({ code: '', description: '', value: 0 });

    useEffect(() => {
        fetch('/api/billing/glosas')
            .then(res => res.json())
            .then(data => { if (Array.isArray(data)) setGlosas(data); })
            .finally(() => setLoading(false));
    }, []);

    const handleSearchInvoice = async () => {
        // Simple search by exact number for MVP
        // Ideally should match invoices?invoiceNumber=X
        const res = await fetch(`/api/billing/invoices?status=Issued`); // Fetch all and filter client side for MVP or better API
        const data = await res.json();
        // Filter locally for now effectively
        if (Array.isArray(data)) {
            const invoice = data.find((i: any) => i.invoiceNumber === searchInvoice);
            if (invoice) setFoundInvoice(invoice);
            else alert('Factura no encontrada (Debe estar Emitida o Radicada)');
        }
    };

    const handleRegister = async () => {
        if (!foundInvoice) return;
        try {
            const res = await fetch('/api/billing/glosas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    invoiceId: foundInvoice.id,
                    ...newGlosa
                })
            });
            if (res.ok) {
                alert('Glosa registrada exitosamente');
                setShowNewModal(false);
                setFoundInvoice(null);
                setNewGlosa({ code: '', description: '', value: 0 });
                window.location.reload();
            }
        } catch (e) { console.error(e); }
    };

    const handleRespond = async () => {
        if (!selectedGlosa) return;

        const payload = {
            action: responseForm.acceptedValue > 0 ? 'Accept' : 'Refute',
            acceptedValue: responseForm.acceptedValue,
            acceptanceNote: (responseForm as any).acceptanceNote || '',
            refusalNote: (responseForm as any).refusalNote || ''
        };

        try {
            const res = await fetch(`/api/billing/glosas/${selectedGlosa.id}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Respuesta registrada exitosamente');
                window.location.reload();
            } else {
                const err = await res.json();
                alert('Error al responder: ' + err.message);
            }
        } catch (e) {
            console.error(e);
            alert('Error de conexión');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-slate-800">Gestión de Glosas</h1>
                <button
                    onClick={() => setShowNewModal(true)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 flex items-center gap-2"
                >
                    ➕ Registrar Glosa
                </button>
            </div>

            {/* New Glosa Modal */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl">
                        <h2 className="text-xl font-bold mb-4">Registrar Nueva Glosa</h2>

                        {!foundInvoice ? (
                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    placeholder="Buscar No. Factura..."
                                    className="flex-1 p-2 border rounded"
                                    value={searchInvoice}
                                    onChange={e => setSearchInvoice(e.target.value)}
                                />
                                <button onClick={handleSearchInvoice} className="bg-slate-800 text-white px-4 rounded font-bold">Buscar</button>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-4 rounded mb-4 border flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Factura #{foundInvoice.invoiceNumber}</p>
                                    <p className="text-sm text-slate-500">{foundInvoice.patient?.firstName} {foundInvoice.patient?.lastName}</p>
                                </div>
                                <button onClick={() => setFoundInvoice(null)} className="text-red-500 text-sm hover:underline">Cambiar</button>
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-bold mb-1">Código Glosa</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={newGlosa.code}
                                    onChange={e => setNewGlosa({ ...newGlosa, code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Valor Glosado</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded"
                                    value={newGlosa.value}
                                    onChange={e => setNewGlosa({ ...newGlosa, value: parseFloat(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">Concepto / Descripción</label>
                                <textarea
                                    className="w-full p-2 border rounded h-24"
                                    value={newGlosa.description}
                                    onChange={e => setNewGlosa({ ...newGlosa, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowNewModal(false)} className="text-slate-500 font-bold px-4">Cancelar</button>
                            <button
                                onClick={handleRegister}
                                disabled={!foundInvoice || !newGlosa.value}
                                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold disabled:opacity-50"
                            >
                                Registrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {loading ? <p>Cargando...</p> : glosas.map(glosa => (
                        <div key={glosa.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-lg text-red-600">Glosa: {glosa.code}</h3>
                                    <p className="text-sm text-slate-500">Factura #{glosa.invoice?.invoiceNumber} - {glosa.invoice?.serviceOrder?.contract?.insurer?.name}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${glosa.status === 'Open' ? 'bg-orange-100 text-orange-700' :
                                    glosa.status === 'Accepted' ? 'bg-red-100 text-red-700' :
                                        'bg-green-100 text-green-700'
                                    }`}>{glosa.status}</span>
                            </div>
                            <p className="text-slate-700 mb-4">{glosa.description}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-bold">Valor Glosado: ${glosa.value.toLocaleString()}</span>
                                {glosa.status === 'Open' && (
                                    <button
                                        onClick={() => setSelectedGlosa(glosa)}
                                        className="text-blue-600 hover:underline font-bold"
                                    >
                                        Responder
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                    {glosas.length === 0 && !loading && <p>No hay glosas registradas.</p>}
                </div>

                {/* Response Panel */}
                <div>
                    {selectedGlosa ? (
                        <div className="bg-white p-6 rounded-xl shadow sticky top-4 border-l-4 border-blue-600">
                            <h3 className="font-bold text-lg mb-4">Responder Glosa</h3>
                            <div className="bg-slate-50 p-4 rounded mb-4">
                                <p className="text-sm font-bold text-slate-500">Valor Glosado</p>
                                <p className="text-xl font-bold text-slate-800">$ {selectedGlosa.value.toLocaleString()}</p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-1">Valor Aceptado (A Pagar)</label>
                                <input
                                    type="number"
                                    className="w-full p-2 border rounded font-bold text-red-600"
                                    max={selectedGlosa.value}
                                    min={0}
                                    value={responseForm.acceptedValue || 0}
                                    onChange={e => {
                                        const inputValue = e.target.value;
                                        const val = inputValue === '' ? 0 : parseFloat(inputValue);
                                        setResponseForm({ ...responseForm, acceptedValue: val, action: val > 0 ? 'Accept' : 'Refute' });
                                    }}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {responseForm.acceptedValue === 0 && "Se Refuta Totalmente (No se paga nada)"}
                                    {responseForm.acceptedValue === selectedGlosa.value && "Se Acepta Totalmente (Se paga el 100%)"}
                                    {responseForm.acceptedValue > 0 && responseForm.acceptedValue < selectedGlosa.value && "Aceptación Parcial (Se paga una parte, se refuta el resto)"}
                                </p>
                            </div>

                            {/* Inputs dinámicos */}
                            {responseForm.acceptedValue > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-bold mb-1 text-red-700">Justificación de lo ACEPTADO</label>
                                    <textarea
                                        className="w-full p-2 border-2 border-red-100 rounded h-20 placeholder-red-200"
                                        placeholder="Por qué se acepta este valor..."
                                        value={(responseForm as any).acceptanceNote || ''}
                                        onChange={e => setResponseForm({ ...responseForm, acceptanceNote: e.target.value } as any)}
                                    />
                                </div>
                            )}

                            {responseForm.acceptedValue < selectedGlosa.value && (
                                <div className="mb-4">
                                    <label className="block text-sm font-bold mb-1 text-blue-700">Justificación de lo REFUTADO (Saldo: $ {(selectedGlosa.value - responseForm.acceptedValue).toLocaleString()})</label>
                                    <textarea
                                        className="w-full p-2 border-2 border-blue-100 rounded h-20 placeholder-blue-200"
                                        placeholder="Por qué NO se acepta este saldo..."
                                        value={(responseForm as any).refusalNote || ''}
                                        onChange={e => setResponseForm({ ...responseForm, refusalNote: e.target.value } as any)}
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-2">
                                <button onClick={() => setSelectedGlosa(null)} className="text-slate-500 hover:text-slate-700 font-bold px-4">Cancelar</button>
                                <button onClick={handleRespond} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 shadow-lg">Confirmar Respuesta</button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
                            Selecciona una glosa para responder.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
