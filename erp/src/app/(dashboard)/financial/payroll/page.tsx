import { accountingService } from '@/lib/services/accountingService';
import Link from 'next/link';

export default async function PayrollPage() {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    const payroll = await accountingService.calculatePayroll(currentPeriod);

    const totalPayroll = payroll.reduce((sum, p) => sum + p.netPay, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/financial" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                    ⬅ Volver
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Nómina de Empleados</h1>
                    <p className="text-slate-500">Periodo de Liquidación: <span className="font-bold text-slate-700">{currentPeriod}</span></p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Total a Pagar (Neto)</h3>
                    <p className="text-4xl font-bold text-teal-600">$ {totalPayroll.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Empleados Activos</h3>
                    <p className="text-4xl font-bold text-slate-700">{payroll.length}</p>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Detalle de Liquidación</h3>
                    <button className="bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                        Procesar Pagos
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                            <tr>
                                <th className="p-4">Empleado</th>
                                <th className="p-4 text-right">Salario Base</th>
                                <th className="p-4 text-right text-red-500">Salud (4%)</th>
                                <th className="p-4 text-right text-red-500">Pensión (4%)</th>
                                <th className="p-4 text-right text-teal-700">Neto a Pagar</th>
                                <th className="p-4 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payroll.map(pay => (
                                <tr key={pay.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-4 font-bold text-slate-700">{pay.employeeName}</td>
                                    <td className="p-4 text-right font-medium text-slate-600">$ {pay.basicSalary.toLocaleString()}</td>
                                    <td className="p-4 text-right text-red-500 font-medium">- $ {pay.healthDeduction.toLocaleString()}</td>
                                    <td className="p-4 text-right text-red-500 font-medium">- $ {pay.pensionDeduction.toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold text-teal-600 text-lg">$ {pay.netPay.toLocaleString()}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${pay.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {pay.status === 'Pending' ? 'Pendiente' : pay.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
