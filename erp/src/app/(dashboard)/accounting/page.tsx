import { accountingService } from '@/lib/services/accountingService';

export default async function AccountingPage() {
    const accounts = await accountingService.getAccounts();
    const totalAssets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + a.balance, 0);

    return (
        <div className="accounting-page">
            <div className="page-header">
                <h1 className="page-title">Contabilidad y NIIF</h1>
                <p className="page-subtitle">Estado de situación financiera y Plan Único de Cuentas.</p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <a href="/accounting/payroll" className="btn btn-outline">Ir a Nómina</a>
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-card">
                    <span className="stat-value">${totalAssets.toLocaleString()}</span>
                    <span className="stat-label">Total Activos</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">${totalLiabilities.toLocaleString()}</span>
                    <span className="stat-label">Total Pasivos</span>
                </div>
                <div className="stat-card">
                    <span className="stat-value">${(totalAssets - totalLiabilities).toLocaleString()}</span>
                    <span className="stat-label">Patrimonio Neto</span>
                </div>
            </div>

            <div className="puc-section card" style={{ padding: 0, marginTop: '32px' }}>
                <div className="section-header" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Plan de Cuentas (PUC)</h3>
                </div>
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Cuenta</th>
                            <th>Tipo</th>
                            <th>Saldo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accounts.map(acc => (
                            <tr key={acc.code}>
                                <td><strong>{acc.code}</strong></td>
                                <td>{acc.name}</td>
                                <td><span className="badge badge-light">{acc.type}</span></td>
                                <td className="amount-cell">${acc.balance.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
