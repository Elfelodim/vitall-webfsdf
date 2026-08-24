'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewInsurerPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: '', nit: '', code: '', regime: 'Contributivo' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/insurers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                alert('EPS Creada con éxito');
                router.push('/admin/eps');
            } else {
                alert('Error al crear EPS');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Nueva EPS / Aseguradora</h1>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow border space-y-4">
                <div>
                    <label className="block text-sm font-bold mb-1">Nombre / Razón Social</label>
                    <input className="w-full p-2 border rounded" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">NIT</label>
                        <input className="w-full p-2 border rounded" required value={form.nit} onChange={e => setForm({ ...form, nit: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Código Habilitación</label>
                        <input className="w-full p-2 border rounded" required value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold mb-1">Régimen</label>
                    <select className="w-full p-2 border rounded" value={form.regime} onChange={e => setForm({ ...form, regime: e.target.value })}>
                        <option value="Contributivo">Contributivo</option>
                        <option value="Subsidiado">Subsidiado</option>
                        <option value="Especial">Especial</option>
                        <option value="Particular">Particular</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4">
                    {loading ? 'Guardando...' : 'Guardar EPS'}
                </button>
            </form>
        </div>
    );
}
