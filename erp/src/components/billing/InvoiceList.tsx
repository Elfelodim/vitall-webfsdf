"use client";

import { Invoice } from '@/types/billing';

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
    return (
        <div className="invoice-list-container card" style={{ padding: 0 }}>
            <table className="patients-table">
                <thead>
                    <tr>
                        <th>Factura</th>
                        <th>Paciente</th>
                        <th>EPS / Pagador</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>RIPS</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {invoices.map(inv => (
                        <tr key={inv.id}>
                            <td><span className="doc-num">{inv.invoiceNumber}</span></td>
                            <td>{inv.patientName}</td>
                            <td>{inv.payerName}</td>
                            <td>{inv.date}</td>
                            <td className="amount-cell">${inv.total.toLocaleString()}</td>
                            <td>
                                <span className={`status-badge ${inv.status.toLowerCase()}`}>{inv.status}</span>
                            </td>
                            <td>
                                {inv.ripsGenerated ? (
                                    <span className="rips-badge yes">Generado</span>
                                ) : (
                                    <span className="rips-badge no">Pendiente</span>
                                )}
                            </td>
                            <td>
                                <a href={`/billing/invoices/${inv.invoiceNumber}`} className="btn-sm" style={{ textDecoration: 'none', display: 'inline-block', lineHeight: '28px', textAlign: 'center' }}>
                                    Ver / PDF
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
