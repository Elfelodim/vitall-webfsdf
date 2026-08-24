
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { admissionsService } from '@/lib/services/admissionsService';
import ReceiptManager from '@/components/admissions/ReceiptManager';
import ServiceItemManager from '@/components/admissions/ServiceItemManager';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function ServiceOrderDetailPage({ params }: PageProps) {
    const { id } = await params;
    const order = await admissionsService.getServiceOrderById(id);

    if (!order) {
        notFound();
    }

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <div className="flex items-center gap-3">
                        <Link href="/admissions" className="text-slate-400 hover:text-slate-600">
                            ← Volver
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-800">Orden de Servicio</h1>
                    </div>
                    <p className="text-slate-500 mt-1 ml-16">Detalle de admisión y recaudos</p>
                </div>
                <div className="flex gap-2 items-center">
                    <span className={`px-4 py-2 rounded-full font-bold text-sm ${order.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {order.status}
                    </span>
                    {order.status !== 'Billed' && (
                        <Link
                            href={`/billing/new?orderId=${order.consecutive}`}
                            className="bg-[#fdcb6e] text-orange-900 px-4 py-2 rounded-lg font-bold hover:bg-[#ffeaa7] flex items-center gap-2"
                        >
                            <span>📄</span>
                            Facturar
                        </Link>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Order Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">📋</span>
                        <h3 className="font-bold text-lg text-slate-800">Información de la Orden</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Consecutivo</span>
                            <span className="block font-mono font-bold text-lg text-slate-700">{order.consecutive}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Fecha</span>
                            <span className="block text-slate-700">{order.admissionDate.toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Contrato</span>
                            <span className="block text-slate-700">{order.contractType || '-'}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Programa</span>
                            <span className="block text-slate-700">{order.program || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Patient Details */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">👤</span>
                        <h3 className="font-bold text-lg text-slate-800">Información del Paciente</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2">
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Nombre Completo</span>
                            <span className="block font-bold text-lg text-slate-700">{order.patient.firstName} {order.patient.lastName}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Documento</span>
                            <span className="block text-slate-700">{order.patient.documentType} {order.patient.documentNumber}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">EPS / Aseguradora</span>
                            <span className="block text-slate-700">{order.patient.eps}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Régimen</span>
                            <span className="block text-slate-700">{order.patient.regime}</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 font-semibold text-xs uppercase">Tipo Usuario</span>
                            <span className="block text-slate-700">{order.patient.userType}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Items Manager */}
            <ServiceItemManager
                serviceOrderId={order.id}
                initialItems={order.items || []}
                contractId={order.contractId || undefined}
            />

            {/* Receipt Manager */}
            <ReceiptManager
                serviceOrderId={order.id}
                patientDocument={order.patientDocument}
                initialReceipts={order.payments}
            />
        </div>
    );
}
