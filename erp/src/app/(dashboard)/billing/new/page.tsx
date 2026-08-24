'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import CupsSearch from '@/components/ui/CupsSearch';

function NewInvoiceContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get('orderId');

    const [patientDoc, setPatientDoc] = useState('');
    const [patientName, setPatientName] = useState('');
    const [loadingPatient, setLoadingPatient] = useState(false);

    // Suggestions
    const [unbilledOrders, setUnbilledOrders] = useState<any[]>([]);

    useEffect(() => {
        // Fetch suggestions
        fetch('/api/admissions/unbilled')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUnbilledOrders(data);
            })
            .catch(err => console.error('Error fetching unbilled orders:', err));

        // Auto-load if param exists
        if (orderIdParam) {
            handleImportOrder(orderIdParam);
        }
    }, [orderIdParam]);

    const handleImportOrder = async (consecutiveOrId: string) => {
        if (!consecutiveOrId) return;
        setLoadingPatient(true);
        try {
            const res = await fetch(`/api/admissions/by-consecutive/${consecutiveOrId}`);
            if (res.ok) {
                const order = await res.json();

                // 1. Set Patient
                setPatientDoc(order.patient.documentNumber);
                setPatientName(`${order.patient.firstName} ${order.patient.lastName}`);

                // 2. Set Items from Order
                if (order.items && order.items.length > 0) {
                    const invoiceItems = order.items.map((item: any) => ({
                        code: item.cupsCode,
                        description: item.cupsDescription,
                        quantity: item.quantity,
                        unitPrice: item.unitValue
                    }));
                    setItems(invoiceItems);
                } else {
                    alert('La orden no tiene servicios registrados.');
                }
            } else {
                alert('❌ Orden no encontrada');
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setLoadingPatient(false);
        }
    };

    // Items state
    const [items, setItems] = useState<{ code: string; description: string; quantity: number; unitPrice: number }[]>([
        { code: '', description: '', quantity: 1, unitPrice: 0 }
    ]);

    const [paymentMethod, setPaymentMethod] = useState('Efectivo');
    const [loading, setLoading] = useState(false);

    // Search patient
    const handleSearchPatient = async () => {
        if (!patientDoc) return;
        setLoadingPatient(true);
        try {
            const res = await fetch(`/api/patients/by-document/${patientDoc}`);
            if (res.ok) {
                const data = await res.json();
                setPatientName(`${data.firstName} ${data.lastName}`);
            } else {
                setPatientName('');
                alert('Paciente no encontrado');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingPatient(false);
        }
    };

    // Item management
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleCupSelect = (index: number, cup: any) => {
        const newItems = [...items];
        newItems[index].code = cup.code;
        newItems[index].description = cup.description;
        setItems(newItems);
    };

    const addItem = () => setItems([...items, { code: '', description: '', quantity: 1, unitPrice: 0 }]);

    const removeItem = (index: number) => {
        if (items.length === 1) return;
        setItems(items.filter((_, i) => i !== index));
    };

    // Calc totals
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = 0;
    const total = subtotal + tax;

    // Submit
    const handleSubmit = async () => {
        if (!patientName) {
            alert('Por favor busca un paciente válido');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/billing/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientDocument: patientDoc,
                    items: items,
                    paymentMethod
                })
            });
            const result = await res.json();
            if (res.ok) {
                alert(`Factura ${result.invoiceNumber} creada con éxito! CUFE Generado.`);
                router.push('/billing');
            } else {
                alert('Error: ' + result.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Nueva Factura de Venta</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Form */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Import from Service Order */}
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-full shadow-sm">
                                📋
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900">Importar Orden de Servicio</h4>
                                <p className="text-xs text-blue-600">Sugerencias disponibles: {unbilledOrders.length}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <input
                                list="unbilled-orders"
                                className="p-2 border border-blue-200 rounded-lg text-sm w-40"
                                placeholder="Buscar Orden..."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleImportOrder(e.currentTarget.value);
                                }}
                            />
                            <datalist id="unbilled-orders">
                                {unbilledOrders.map(order => (
                                    <option key={order.id} value={order.consecutive}>
                                        {order.patient.firstName} {order.patient.lastName} - {new Date(order.admissionDate).toLocaleDateString()}
                                    </option>
                                ))}
                            </datalist>
                            <button
                                onClick={(e: any) => {
                                    const input = e.target.previousSibling.previousSibling as HTMLInputElement;
                                    handleImportOrder(input.value);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700"
                            >
                                Importar
                            </button>
                        </div>
                    </div>

                    {/* Patient Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-[#005f99] mb-4">Datos del Cliente</h3>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Documento Paciente</label>
                                <div className="flex gap-2">
                                    <input
                                        className="w-full p-2 border rounded-lg"
                                        value={patientDoc}
                                        onChange={e => setPatientDoc(e.target.value)}
                                        placeholder="CC 12345678"
                                    />
                                    <button
                                        onClick={handleSearchPatient}
                                        className="bg-slate-100 px-4 py-2 rounded-lg font-bold hover:bg-slate-200"
                                    >
                                        🔍
                                    </button>
                                </div>
                            </div>
                            <div className="flex-[2]">
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre</label>
                                <input
                                    className="w-full p-2 border rounded-lg bg-slate-50 text-slate-500"
                                    readOnly
                                    value={loadingPatient ? 'Buscando...' : patientName}
                                    placeholder="Nombre del paciente"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-[#005f99]">Detalle de Factura</h3>
                            <button onClick={addItem} className="text-sm text-green-600 font-bold hover:underline">+ Agregar Ítem</button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start">
                                    <div className="w-1/3">
                                        <CupsSearch
                                            placeholder="Buscar CUPS..."
                                            onSelect={(cup) => handleCupSelect(idx, cup)}
                                        // Optional: Pass default value if editing
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            placeholder="Descripción del servicio/producto"
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={item.description}
                                            onChange={e => updateItem(idx, 'description', e.target.value)}
                                        />
                                    </div>
                                    <div className="w-20">
                                        <input
                                            type="number"
                                            placeholder="Cant"
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={item.quantity}
                                            onChange={e => updateItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <input
                                            type="number"
                                            placeholder="Precio"
                                            className="w-full p-2 border rounded-lg text-sm"
                                            value={item.unitPrice}
                                            onChange={e => updateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        />
                                    </div>
                                    <button onClick={() => removeItem(idx)} className="p-2 text-red-400 hover:text-red-600">
                                        🗑️
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Summary */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit sticky top-8">
                    <h3 className="font-bold text-slate-800 mb-6 text-xl">Resumen</h3>

                    <div className="flex justify-between mb-2 text-slate-600">
                        <span>Subtotal</span>
                        <span>$ {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-4 text-slate-600">
                        <span>Impuestos (0%)</span>
                        <span>$ {tax.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-4 flex justify-between mb-8 text-xl font-bold text-[#005f99]">
                        <span>Total</span>
                        <span>$ {total.toLocaleString()}</span>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Medio de Pago</label>
                        <select
                            className="w-full p-3 border rounded-xl bg-slate-50"
                            value={paymentMethod}
                            onChange={e => setPaymentMethod(e.target.value)}
                        >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta Débito">Tarjeta Débito</option>
                            <option value="Tarjeta Crédito">Tarjeta Crédito</option>
                            <option value="Transferencia">Transferencia</option>
                        </select>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-[#005f99] text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 hover:-translate-y-1 transition disabled:opacity-50"
                    >
                        {loading ? 'Emitiendo...' : 'Emitir Factura Electrónica'}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        Se generará el CUFE y se firmará digitalmente el documento.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function NewInvoicePage() {
    return (
        <Suspense fallback={<div>Cargando...</div>}>
            <NewInvoiceContent />
        </Suspense>
    );
}
