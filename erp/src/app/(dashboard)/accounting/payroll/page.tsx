import { accountingService } from '@/lib/services/accountingService';

export default async function PayrollPage() {
    const currentPeriod = new Date().toISOString().slice(0, 7); // YYYY-MM
    const payroll = await accountingService.calculatePayroll(currentPeriod);

    const totalPayroll = payroll.reduce((sum, p) => sum + p.netPay, 0);

    return (
        <div className="payroll-page">
            <div className="page-header">
                <h1 className="page-title">Nómina de Empleados</h1>
                <p className="page-subtitle">Periodo: {currentPeriod}</p>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">${totalPayroll.toLocaleString()}</span>
                    <span className="stat-label">Total a Pagar (Neto)</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">{payroll.length}</span>
                    <span className="stat-label">Empleados</span>
                </div>
            </div>

            <div className="payroll-list card" style={{ padding: 0, marginTop: '32px' }}>
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>Empleado</th>
                            <th>Salario Base</th>
                            <th>Salud (4%)</th>
                            <th>Pensión (4%)</th>
                            <th>Neto a Pagar</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payroll.map(pay => (
                            <tr key={pay.id}>
                                <td>{pay.employeeName}</td>
                                <td className="amount-cell">${pay.basicSalary.toLocaleString()}</td>
                                <td className="amount-cell deduction">-${pay.healthDeduction.toLocaleString()}</td>
                                <td className="amount-cell deduction">-${pay.pensionDeduction.toLocaleString()}</td>
                                <td className="amount-cell net-pay">${pay.netPay.toLocaleString()}</td>
                                <td><span className="status-badge draft">{pay.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
}
