import InvoiceList from '@/components/billing/InvoiceList';
import { billingService } from '@/lib/services/billingService';
import { admissionsService } from '@/lib/services/admissionsService';
import Link from 'next/link';
import { Invoice } from '@/types/billing';

export default async function BillingPage() {
    const rawInvoices = await billingService.getInvoices();
    const admissionStats = await admissionsService.getDailyStats();

    // Map Prisma invoices to Invoice type expected by InvoiceList
    const invoices: Invoice[] = rawInvoices.map(inv => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        patientId: inv.patientDocument,
        patientName: `${inv.patient.firstName} ${inv.patient.lastName}`,
        payerId: inv.patient.eps || '',
        payerName: inv.patient.eps || 'Particular',
        date: inv.date.toLocaleDateString(),
        dueDate: inv.dueDate.toLocaleDateString(),
        subtotal: inv.subtotal,
        tax: inv.tax,
        total: inv.total,
        status: inv.status as 'Draft' | 'Issued' | 'Paid',
        ripsGenerated: inv.ripsGenerated,
        items: [] // List view doesn't render items details usually
    }));

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.total, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Facturación Electrónica</h1>
                    <p className="text-slate-500">Gestión de emisión y recepción de documentos</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/admissions" className="px-4 py-2 border border-blue-200 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-2">
                        📋 Admisiones
                    </Link>
                    <Link href="/billing/config" className="px-4 py-2 border border-slate-300 rounded-lg font-semibold text-slate-600 hover:bg-slate-50">
                        ⚙️ Configuración DIAN
                    </Link>
                    <Link href="/billing/new" className="px-4 py-2 bg-[#005f99] text-white rounded-lg font-bold hover:bg-[#004e80]">
                        + Nueva Factura
                    </Link>
                </div>
            </header>

            {/* Quick Actions / Submodules */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                <Link href="/billing/radicacion" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">
                    📫 Radicación de Cuentas
                </Link>
                <Link href="/billing/glosas" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">
                    ⚠️ Gestión de Glosas
                </Link>
                <Link href="/dashboard/portfolio" className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 font-bold text-slate-700 whitespace-nowrap">
                    💰 Cartera (Portfolio)
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Facturas Emitidas (Mes)</h3>
                    <p className="text-3xl font-bold text-slate-800">{invoices.length}</p>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Estado DIAN</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-bold">
                            {invoices.filter(i => i.status === 'Paid').length} Pagadas
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-bold">
                            {invoices.filter(i => i.status === 'Issued').length} Emitidas
                        </span>
                    </div>
                </div>
                <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 font-bold text-sm uppercase mb-2">Ventas Totales</h3>
                    <p className="text-3xl font-bold text-[#005f99]">$ {totalBilled.toLocaleString()}</p>
                </div>

                {/* Admission KPI */}
                <div className="p-6 bg-indigo-50 rounded-2xl shadow-sm border border-indigo-100">
                    <h3 className="text-indigo-600 font-bold text-sm uppercase mb-2">Admisiones (Hoy)</h3>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-slate-800">
                            $ {admissionStats.todayReceipts.toLocaleString()}
                            <span className="text-xs font-normal text-slate-500 ml-1">en Copagos</span>
                        </span>
                        <span className="text-sm font-semibold text-indigo-500 mt-1">
                            {admissionStats.openOrdersCount} Órdenes Abiertas
                        </span>
                    </div>
                </div>
            </div>

            {invoices.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <InvoiceList invoices={invoices} />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center py-20">
                    <p className="text-slate-400 text-lg">No hay facturas recientes</p>
                    <Link href="/billing/new" className="text-[#005f99] font-bold mt-2 inline-block hover:underline">
                        Crear la primera factura
                    </Link>
                </div>
            )}
        </div>
    );
}
