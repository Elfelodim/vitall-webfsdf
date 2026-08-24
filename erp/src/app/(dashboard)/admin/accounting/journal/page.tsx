'use client';

import { useState, useEffect } from 'react';

export default function JournalPage() {
    const [entries, setEntries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        try {
            const res = await fetch('/api/admin/accounting/journal');
            if (res.ok) {
                setEntries(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id: string) => {
        if (expandedRow === id) {
            setExpandedRow(null);
        } else {
            setExpandedRow(id);
        }
    };

    // Format currency
    const fmt = (n: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(n);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Libro Diario</h1>
                    <p className="text-slate-500">Registro cronológico de movimientos contables.</p>
                </div>
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600">Fecha</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Descripción</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Referencia</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-right">Débitos</th>
                            <th className="px-6 py-4 font-bold text-slate-600 text-right">Créditos</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando...</td></tr>
                        ) : entries.length === 0 ? (
                            <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay movimientos registrados.</td></tr>
                        ) : (
                            entries.map(entry => {
                                const totalDebit = entry.lines.reduce((s: any, l: any) => s + l.debit, 0);
                                const totalCredit = entry.lines.reduce((s: any, l: any) => s + l.credit, 0);
                                const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

                                return (
                                    <>
                                        <tr
                                            key={entry.id}
                                            onClick={() => toggleRow(entry.id)}
                                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedRow === entry.id ? 'bg-slate-50' : ''}`}
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                {new Date(entry.date).toLocaleDateString()}
                                                <div className="text-xs text-slate-400">{new Date(entry.date).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{entry.description}</td>
                                            <td className="px-6 py-4 text-xs">
                                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded">
                                                    {entry.referenceType} #{entry.referenceId?.substring(0, 8)}...
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-right font-mono text-teal-700">{fmt(totalDebit)}</td>
                                            <td className="px-6 py-4 text-sm text-right font-mono text-teal-700">{fmt(totalCredit)}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full ${isBalanced ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {isBalanced ? 'OK' : 'Error'}
                                                </span>
                                            </td>
                                        </tr>
                                        {expandedRow === entry.id && (
                                            <tr className="bg-slate-50/50">
                                                <td colSpan={6} className="px-6 py-4">
                                                    <div className="bg-white border rounded-lg overflow-hidden">
                                                        <table className="w-full text-sm">
                                                            <thead className="bg-slate-100 text-slate-600">
                                                                <tr>
                                                                    <th className="px-4 py-2 text-left">Cuenta</th>
                                                                    <th className="px-4 py-2 text-left">Nombre</th>
                                                                    <th className="px-4 py-2 text-right">Débito</th>
                                                                    <th className="px-4 py-2 text-right">Crédito</th>
                                                                    <th className="px-4 py-2 text-left">Nota</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-slate-100">
                                                                {entry.lines.map((line: any) => (
                                                                    <tr key={line.id}>
                                                                        <td className="px-4 py-2 font-mono text-slate-600">{line.accountCode}</td>
                                                                        <td className="px-4 py-2 text-slate-800">{line.account?.name || 'Desconocida'}</td>
                                                                        <td className="px-4 py-2 text-right font-mono">{line.debit > 0 ? fmt(line.debit) : '-'}</td>
                                                                        <td className="px-4 py-2 text-right font-mono">{line.credit > 0 ? fmt(line.credit) : '-'}</td>
                                                                        <td className="px-4 py-2 text-slate-500 italic">{line.notes}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
