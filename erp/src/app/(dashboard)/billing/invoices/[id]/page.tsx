'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function InvoiceDetailPage() {
    const params = useParams(); // { id }
    const router = useRouter();
    // As of Next 15, params is sometimes a Promise or just object. If useParams() is from next/navigation, it returns object directly usually, 
    // but the `page` props in server components receive a promise.
    // However, `useParams` hook generally returns the object. 
    // Let's assume standard behavior or safely access.
    const invoiceId = params?.id as string;

    const [invoice, setInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!invoiceId) return;
        fetchInvoice();
    }, [invoiceId]);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/billing/invoices/${invoiceId}`);
            if (res.ok) {
                setInvoice(await res.json());
            } else {
                alert('Factura no encontrada');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const generatePDF = () => {
        if (!invoice) return;

        const doc = new jsPDF();

        // --- Header Left: Clinic Info ---
        doc.setFontSize(18);
        doc.setTextColor(0, 95, 153);
        doc.text('CLÍNICA ANTINEO', 14, 20);

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text('NIT: 900.123.456-7', 14, 27);
        doc.text('Dirección: Calle 123 # 45-67, Bogotá', 14, 32);
        doc.text('Teléfono: (601) 123 4567', 14, 37);

        // --- Header Right: Invoice Info ---
        // Align to right margin (approx 195mm)
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(`Factura de Venta No. ${invoice.invoiceNumber}`, 195, 20, { align: 'right' });

        doc.setFontSize(9);
        doc.setTextColor(80);
        doc.text(`Fecha de Emisión: ${new Date(invoice.date).toLocaleDateString()}`, 195, 27, { align: 'right' });
        doc.text(`Fecha de Vencimiento: ${new Date(invoice.dueDate).toLocaleDateString()}`, 195, 32, { align: 'right' });
        doc.text(`Medio de Pago: ${invoice.paymentMethod}`, 195, 37, { align: 'right' });

        // --- Resolution Info (Below Header Left) ---
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(`Autorización de Facturación No. ${invoice.resolutionNumber}`, 14, 46);
        doc.text(`Prefijo ${invoice.prefix} desde ${invoice.prefix}1 hasta ${invoice.prefix}1000`, 14, 50);

        // --- Separator Line ---
        doc.setDrawColor(220);
        doc.line(14, 55, 195, 55);

        // --- Client Details (Clean Layout) ---
        doc.setFontSize(11);
        doc.setTextColor(0, 95, 153);
        doc.text('Datos del Adquirente', 14, 64);

        doc.setFontSize(9);
        doc.setTextColor(0);

        // Col 1
        doc.setFont(undefined, 'bold');
        doc.text('Nombre:', 14, 72);
        doc.setFont(undefined, 'normal');
        doc.text(`${invoice.patient.firstName} ${invoice.patient.lastName}`, 35, 72);

        doc.setFont(undefined, 'bold');
        doc.text('Documento:', 14, 78);
        doc.setFont(undefined, 'normal');
        doc.text(`${invoice.patient.documentType} ${invoice.patient.documentNumber}`, 35, 78);

        // Col 2
        doc.setFont(undefined, 'bold');
        doc.text('Dirección:', 110, 72);
        doc.setFont(undefined, 'normal');
        doc.text(`${invoice.patient.address || 'N/A'}`, 130, 72);

        doc.setFont(undefined, 'bold');
        doc.text('Teléfono:', 110, 78);
        doc.setFont(undefined, 'normal');
        doc.text(`${invoice.patient.phone || 'N/A'}`, 130, 78);

        // --- Items Table ---
        const tableBody = invoice.items.map((item: any) => [
            item.code,
            item.description,
            item.quantity,
            `$ ${item.unitPrice.toLocaleString()}`,
            `$ ${item.total.toLocaleString()}`
        ]);

        autoTable(doc, {
            startY: 88,
            head: [['Código', 'Descripción', 'Cant', 'Precio Unitario', 'Total']],
            body: tableBody,
            headStyles: { fillColor: [0, 95, 153] },
            theme: 'striped',
            styles: { fontSize: 9 }
        });

        // --- Totals ---
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal: $ ${invoice.subtotal.toLocaleString()}`, 190, finalY, { align: 'right' });
        doc.text(`Impuestos: $ ${invoice.tax.toLocaleString()}`, 190, finalY + 6, { align: 'right' });

        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`TOTAL: $ ${invoice.total.toLocaleString()}`, 190, finalY + 14, { align: 'right' });

        // --- Footer: CUFE & QR ---
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(120);
        doc.text('CUFE:', 14, finalY + 30);

        const cufeLines = doc.splitTextToSize(invoice.cufe || 'N/A', 180);
        doc.text(cufeLines, 14, finalY + 35);

        doc.setFontSize(7);
        doc.text('Representación Gráfica de Factura Electrónica - Generado por ANTINEO', 14, 280); // Bottom of page

        doc.save(`${invoice.invoiceNumber}.pdf`);
    };

    if (loading) return <div className="p-8">Cargando factura...</div>;
    if (!invoice) return <div className="p-8">Error al cargar factura.</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800">Factura {invoice.invoiceNumber}</h1>
                <div className="flex gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${invoice.dianStatus === 'Accepted' ? 'bg-green-100 text-green-700' :
                            invoice.dianStatus === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                        {invoice.dianStatus === 'Issued' ? 'Enviada DIAN' : invoice.dianStatus}
                    </span>
                </div>
            </div>

            {/* Preview Card */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 mb-8 max-w-full overflow-hidden">
                <div className="flex justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-[#005f99]">CLÍNICA ANTINEO</h2>
                        <p className="text-sm text-slate-500">NIT 900.123.456-7</p>
                        <p className="text-sm text-slate-500">Calle 123 # 45-67</p>
                    </div>
                    <div className="text-right">
                        <h3 className="font-bold text-xl">{invoice.invoiceNumber}</h3>
                        <p className="text-sm">Fecha: {new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                </div>

                <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                    <h4 className="font-bold text-sm mb-2 text-slate-700">Adquirente</h4>
                    <p>{invoice.patient.firstName} {invoice.patient.lastName}</p>
                    <p className="text-sm text-slate-500">{invoice.patient.documentType} {invoice.patient.documentNumber}</p>
                </div>

                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b text-left text-sm text-slate-600">
                            <th className="py-2">Descripción</th>
                            <th className="py-2 text-center">Cant</th>
                            <th className="py-2 text-right">Precio</th>
                            <th className="py-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item: any) => (
                            <tr key={item.id} className="border-b text-sm">
                                <td className="py-3">{item.description}</td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">$ {item.unitPrice.toLocaleString()}</td>
                                <td className="py-3 text-right">$ {item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex justify-end">
                    <div className="w-48">
                        <div className="flex justify-between mb-2 text-sm">
                            <span>Subtotal</span>
                            <span>$ {invoice.subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between mb-2 text-sm">
                            <span>Impuestos</span>
                            <span>$ {invoice.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t font-bold text-lg text-[#005f99]">
                            <span>Total</span>
                            <span>$ {invoice.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-xs text-slate-400 break-all">
                    <p className="font-bold mb-1">CUFE:</p>
                    {invoice.cufe}
                </div>
            </div>

            <div className="flex justify-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                    Volver
                </button>
                <button
                    onClick={generatePDF}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 hover:-translate-y-1 transition flex items-center gap-2"
                >
                    📄 Descargar PDF
                </button>
            </div>
        </div>
    );
}
