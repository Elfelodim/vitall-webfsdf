import Link from 'next/link';
import { accountingService } from '@/lib/services/accountingService';
import { prisma } from '@/lib/prisma';

export default async function FinancialPage() {
    // 1. Fetch Accounting Data
    const accounts = await accountingService.getAccounts();
    const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);

    // 2. Fetch Portfolio Data for Indicators
    const invoices = await prisma.invoice.findMany({ where: { status: 'Issued' } });
    const totalReceivable = invoices.reduce((sum, inv) => sum + inv.currentBalance, 0);

    const now = new Date();
    const overdueReceivable = invoices.filter(inv => new Date(inv.dueDate) < now).reduce((sum, inv) => sum + inv.currentBalance, 0);

    // Calculate Sales (Last 360 days approximation for Annual Turnover)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const salesData = await prisma.invoice.aggregate({
        _sum: { total: true },
        where: { date: { gte: oneYearAgo }, status: { in: ['Issued', 'Paid'] } }
    });
    const totalSalesYear = salesData._sum.total || totalReceivable || 1; // Fallback to avoid Inf

    // 3. Calculate Ratios
    const rotationTimes = totalSalesYear / (totalReceivable || 1);
    const dso = 360 / (rotationTimes || 1); // Days Sales Outstanding
    const delinquencyRatio = (overdueReceivable / (totalReceivable || 1)) * 100;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Módulo Financiero</h1>
            <p className="text-slate-500 mb-8">Gestión contable, nómina y reportes financieros (NIIF).</p>

            {/* KPI Cards (Accounting) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Assets - Trend Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Total Activos</h3>
                        <p className="text-4xl font-bold text-green-600">$ {totalAssets.toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">Recursos controlados</p>
                    </div>
                    {/* Visual: Ascending Trend Line */}
                    <div className="w-24 h-16 relative opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 100 50" className="w-full h-full stroke-green-500 fill-none stroke-[3]">
                            <path d="M0,45 Q25,45 25,35 T50,25 T75,10 T100,5" strokeLinecap="round" />
                            <area />
                        </svg>
                        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-50 to-transparent"></div>
                    </div>
                </div>

                {/* Total Liabilities - Bar Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Total Pasivos</h3>
                        <p className="text-4xl font-bold text-red-600">$ {totalLiabilities.toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">Obligaciones presentes</p>
                    </div>
                    {/* Visual: Bar Chart */}
                    <div className="h-16 w-16 flex items-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="bg-red-300 w-1/3 rounded-t-sm" style={{ height: '40%' }}></div>
                        <div className="bg-red-400 w-1/3 rounded-t-sm" style={{ height: '80%' }}></div>
                        <div className="bg-red-600 w-1/3 rounded-t-sm" style={{ height: '60%' }}></div>
                    </div>
                </div>

                {/* Net Equity - Pie Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center relative overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative z-10">
                        <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Patrimonio Neto</h3>
                        <p className="text-4xl font-bold text-[#005f99]">$ {(totalAssets - totalLiabilities).toLocaleString()}</p>
                        <p className="text-sm text-slate-400 mt-2">Activo residual</p>
                    </div>
                    {/* Visual: Abstract Donut Chart */}
                    <div className="w-16 h-16 relative opacity-80 group-hover:opacity-100 transition-opacity">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                            <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path className="text-[#005f99]" strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-[#005f99] text-xs">
                            %
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Indicators Section */}
            <div className="mb-10">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Indicadores de Gestión (KPIs)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* DSO Indicator */}
                    <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                            📆
                        </div>
                        <div>
                            <p className="text-xs font-bold text-indigo-500 uppercase">Días de Cartera (DSO)</p>
                            <p className="text-2xl font-bold text-slate-800">{dso.toFixed(0)} <span className="text-sm text-slate-500 font-normal">días</span></p>
                            <p className="text-xs text-slate-400">Tiempo promedio de cobro</p>
                        </div>
                    </div>

                    {/* Rotation Indicator */}
                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                            🔄
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-500 uppercase">Rotación de Cartera</p>
                            <p className="text-2xl font-bold text-slate-800">{rotationTimes.toFixed(1)}x <span className="text-sm text-slate-500 font-normal">/ año</span></p>
                            <p className="text-xs text-slate-400">Veces que se renueva la cartera</p>
                        </div>
                    </div>

                    {/* Delinquency Indicator */}
                    <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100 flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">
                            📉
                        </div>
                        <div>
                            <p className="text-xs font-bold text-orange-500 uppercase">Índice de Morosidad</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-slate-800">{delinquencyRatio.toFixed(1)}%</p>
                                <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: `${Math.min(delinquencyRatio, 100)}%` }}></div>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400">% de cartera vencida</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Solid Action Buttons */}
            <div className="mb-10">
                <h3 className="font-bold text-lg mb-4 text-slate-800">Operaciones Financieras</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/financial/payroll" className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-teal-400">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-3xl">👥</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Nómina</h3>
                        <p className="text-teal-100 text-sm font-medium">
                            Liquidación y gestión de pagos a empleados.
                        </p>
                    </Link>

                    <Link href="/financial/puc" className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-indigo-400">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-3xl">📚</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Plan de Cuentas (PUC)</h3>
                        <p className="text-indigo-100 text-sm font-medium">
                            Catálogo de cuentas contables.
                        </p>
                    </Link>

                    <button className="group bg-gradient-to-br from-rose-500 to-rose-600 text-white p-6 rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-rose-400 opacity-90">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                            <span className="text-3xl">📊</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Informes Financieros</h3>
                        <p className="text-rose-100 text-sm font-medium">
                            Balance General y Estado de Resultados.
                        </p>
                    </button>
                </div>
            </div>

            {/* Recent Accounts Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800">Resumen de Cuentas Principales</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Código</th>
                                <th className="p-4">Cuenta</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4 text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {accounts.slice(0, 5).map(acc => (
                                <tr key={acc.code} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">{acc.code}</td>
                                    <td className="p-4 text-slate-600">{acc.name}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${acc.type === 'Asset' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {acc.type === 'Asset' ? 'Activo' : 'Pasivo'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-slate-800">$ {acc.balance.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
