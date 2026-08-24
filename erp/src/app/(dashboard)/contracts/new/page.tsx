'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewContractPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        clientName: '',
        nit: '',
        code: '',
        manualType: 'SOAT',
        adjustmentPercentage: 0,
        validityStart: '',
        validityEnd: '',
        budgetCap: 0,
        capPeriod: 'Mensual'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                alert('✅ Contrato creado exitosamente');
                router.push('/contracts');
            } else {
                const err = await res.json();
                alert('❌ Error: ' + err.message);
            }
        } catch (error) {
            console.error(error);
            alert('Error inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Nuevo Contrato</h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">

                {/* Section 1: Basic Info */}
                <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Información del Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Cliente (EPS/Aseguradora)</label>
                        <input
                            required
                            className="w-full p-3 border rounded-xl"
                            value={form.clientName}
                            onChange={e => setForm({ ...form, clientName: e.target.value })}
                            placeholder="Ej: EPS Sanitas"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">NIT</label>
                        <input
                            required
                            className="w-full p-3 border rounded-xl"
                            value={form.nit}
                            onChange={e => setForm({ ...form, nit: e.target.value })}
                            placeholder="Ej: 800.123.456-7"
                        />
                    </div>
                </div>

                {/* Section 2: Contract Details */}
                <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Condiciones Contractuales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Manual Tarifario Base</label>
                        <select
                            className="w-full p-3 border rounded-xl bg-slate-50"
                            value={form.manualType}
                            onChange={e => setForm({ ...form, manualType: e.target.value })}
                        >
                            <option value="SOAT">SOAT (Salario Minimo)</option>
                            <option value="ISS2000">ISS 2000</option>
                            <option value="ISS2001">ISS 2001</option>
                            <option value="ISS2004">ISS 2004</option>
                            <option value="OWN">Tarifa Propia / Particular</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Porcentaje Ajuste (+/-)</label>
                        <div className="relative">
                            <input
                                type="number"
                                className="w-full p-3 border rounded-xl pl-8"
                                value={form.adjustmentPercentage}
                                onChange={e => setForm({ ...form, adjustmentPercentage: parseFloat(e.target.value) })}
                            />
                            <span className="absolute left-3 top-3.5 text-slate-400">%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Ej: 10 para +10%, -5 para -5%</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Código Interno</label>
                        <input
                            required
                            className="w-full p-3 border rounded-xl font-mono uppercase"
                            value={form.code}
                            onChange={e => setForm({ ...form, code: e.target.value })}
                            placeholder="CONT-001"
                        />
                    </div>
                </div>

                {/* Section 3: Validity & Cap */}
                <h3 className="text-lg font-bold text-blue-600 mb-4 border-b pb-2">Vigencia y Techos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Inicio Vigencia</label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 border rounded-xl"
                            value={form.validityStart}
                            onChange={e => setForm({ ...form, validityStart: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Fin Vigencia</label>
                        <input
                            type="date"
                            required
                            className="w-full p-3 border rounded-xl"
                            value={form.validityEnd}
                            onChange={e => setForm({ ...form, validityEnd: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Techo Presupuestal ($)</label>
                        <input
                            type="number"
                            className="w-full p-3 border rounded-xl font-bold text-blue-600"
                            value={form.budgetCap}
                            onChange={e => setForm({ ...form, budgetCap: parseFloat(e.target.value) })}
                            placeholder="0 (Sin Techo)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Periodo del Techo</label>
                        <select
                            className="w-full p-3 border rounded-xl bg-slate-50"
                            value={form.capPeriod}
                            onChange={e => setForm({ ...form, capPeriod: e.target.value })}
                        >
                            <option value="Mensual">Mensual</option>
                            <option value="Bimestral">Bimestral</option>
                            <option value="Trimestral">Trimestral</option>
                            <option value="Semestral">Semestral</option>
                            <option value="Anual">Anual</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                    <button type="button" onClick={() => router.back()} className="px-6 py-3 rounded-xl border font-bold text-slate-600 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-blue-700 hover:-translate-y-1 transition disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : 'Crear Contrato'}
                    </button>
                </div>

            </form>
        </div>
    );
}
