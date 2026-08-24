'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PortfolioPage() {
    const [stats, setStats] = useState({
        totalReceivable: 0,
        overdue: 0,
        aging: { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch stats (Mock or implemented API)
        // For MVP, we can fetch all open invoices and calculate client-side if API isn't ready
        fetch('/api/billing/invoices?status=Issued')
            .then(res => res.json())
            .then(invoices => {
                if (!Array.isArray(invoices)) return;

                let total = 0;
                let overdue = 0;
                const aging = { '0-30': 0, '30-60': 0, '60-90': 0, '90+': 0 };

                const now = new Date();

                invoices.forEach((inv: any) => {
                    const balance = inv.currentBalance || inv.total; // Use currentBalance if updated
                    total += balance;

                    const daysDiff = Math.floor((now.getTime() - new Date(inv.date).getTime()) / (1000 * 3600 * 24));

                    if (daysDiff > 30) overdue += balance;

                    if (daysDiff <= 30) aging['0-30'] += balance;
                    else if (daysDiff <= 60) aging['30-60'] += balance;
                    else if (daysDiff <= 90) aging['60-90'] += balance;
                    else aging['90+'] += balance;
                });

                setStats({ totalReceivable: total, overdue, aging });
            })
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Cartera (Cuentas por Cobrar)</h1>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Total Recoverable Card with Mini Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Total por Cobrar</h3>
                        <p className="text-4xl font-bold text-[#005f99]">$ {stats.totalReceivable.toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">Saldo total pendiente de pago</p>
                    </div>
                    {/* Visual: Abstract Bar Chart */}
                    <div className="h-16 w-24 flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="bg-blue-200 w-1/4 rounded-t-sm" style={{ height: '30%' }}></div>
                        <div className="bg-blue-300 w-1/4 rounded-t-sm" style={{ height: '50%' }}></div>
                        <div className="bg-blue-500 w-1/4 rounded-t-sm" style={{ height: '70%' }}></div>
                        <div className="bg-[#005f99] w-1/4 rounded-t-sm" style={{ height: '40%' }}></div>
                    </div>
                </div>

                {/* Overdue Card with Circular Gauge */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Cartera Vencida (&gt;30 días)</h3>
                        <p className="text-4xl font-bold text-red-600">$ {stats.overdue.toLocaleString()}</p>
                        <p className="text-sm text-red-400 mt-2 font-medium">
                            {stats.totalReceivable > 0 ? ((stats.overdue / stats.totalReceivable) * 100).toFixed(1) : 0}% de la cartera
                        </p>
                    </div>
                    {/* Visual: SVG Circular Gauge */}
                    <div className="w-20 h-20 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            {/* Background Circle */}
                            <circle cx="50%" cy="50%" r="36" className="stroke-slate-100 fill-none" strokeWidth="8" />
                            {/* Progress Circle */}
                            <circle
                                cx="50%"
                                cy="50%"
                                r="36"
                                className="stroke-red-500 fill-none transition-all duration-1000 ease-out"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 36}
                                strokeDashoffset={(2 * Math.PI * 36) - ((2 * Math.PI * 36) * (stats.totalReceivable > 0 ? (stats.overdue / stats.totalReceivable) : 0))}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-red-600 text-xs">
                            ⚠️
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Buttons Grid */}
            <div className="mb-10">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Gestión y Operaciones</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/billing/radicacion" className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-blue-400">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-2xl">📦</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">Radicación</h4>
                        <p className="text-xs text-blue-100 font-medium">Agrupar y enviar facturas</p>
                    </Link>

                    <Link href="/billing/rips" className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-indigo-400">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">Generador RIPS</h4>
                        <p className="text-xs text-indigo-100 font-medium">JSON Res. 2275 - 2024</p>
                    </Link>

                    <Link href="/billing/glosas" className="group bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg shadow-orange-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-orange-400">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">Gestionar Glosas</h4>
                        <p className="text-xs text-orange-100 font-medium">Responder y conciliar</p>
                    </Link>

                    <Link href="/billing/credit-notes" className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-purple-400">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-2xl">💳</span>
                        </div>
                        <h4 className="font-bold text-lg mb-1">Notas Crédito</h4>
                        <p className="text-xs text-purple-100 font-medium">Devoluciones manuales</p>
                    </Link>
                </div>
            </div>

            {/* Aging Report */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-lg mb-6 text-slate-800">Edades de Cartera</h3>
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(stats.aging).map(([range, value]) => (
                        <div key={range} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                            <span className="block text-slate-500 text-sm font-bold mb-1">{range} Días</span>
                            <span className={`block text-xl font-bold ${range === '90+' && value > 0 ? 'text-red-600' : 'text-slate-700'}`}>
                                $ {value.toLocaleString()}
                            </span>
                            <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full ${range === '90+' ? 'bg-red-500' : 'bg-blue-500'}`}
                                    style={{ width: `${stats.totalReceivable > 0 ? (value / stats.totalReceivable) * 100 : 0}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Activity / Unpaid List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Facturas Pendientes Recientes</h3>
                    <Link href="/billing" className="text-blue-600 font-bold text-sm hover:underline">Ver Todas</Link>
                </div>
                {/* We could reuse InvoiceList or fetch specific data here */}
                <div className="p-6 text-center text-slate-400 text-sm">
                    (Listado detallado disponible en módulo de Facturación)
                </div>
            </div>
        </div>
    );
}
