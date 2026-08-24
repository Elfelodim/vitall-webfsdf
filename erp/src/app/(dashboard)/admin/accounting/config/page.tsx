'use client';

import { useState, useEffect } from 'react';

const KNOWN_KEYS = [
    { key: 'GLOBAL_ASSET_ACCOUNT', label: 'Caja General / Activo', module: 'Treasury', default: '110505' },
    { key: 'GLOBAL_RECEIVABLE_ACCOUNT', label: 'Clientes (Ctas por Cobrar)', module: 'Billing', default: '1305' },
    { key: 'GLOBAL_INCOME_ACCOUNT', label: 'Ingresos Operacionales', module: 'Billing', default: '4105' },
    { key: 'GLOBAL_TAX_ACCOUNT', label: 'Impuesto Generado (IVA)', module: 'Billing', default: '2408' },
    { key: 'INVENTORY_ASSET_ACCOUNT', label: 'Inventarios (Activo)', module: 'Inventory', default: '1435' },
    { key: 'INVENTORY_COGS_ACCOUNT', label: 'Costo de Ventas', module: 'Inventory', default: '6135' },
    { key: 'INVENTORY_ADJUSTMENT_ACCOUNT', label: 'Ajuste Inventario (Contrapartida)', module: 'Inventory', default: '3205' },
    { key: 'PAYROLL_EXPENSE_ACCOUNT', label: 'Gastos de Personal', module: 'Payroll', default: '5105' },
    { key: 'PAYROLL_LIABILITY_ACCOUNT', label: 'Salarios por Pagar', module: 'Payroll', default: '2505' },
];

export default function AccountingConfigPage() {
    const [configs, setConfigs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        try {
            const res = await fetch('/api/admin/accounting/config');
            if (res.ok) {
                const data = await res.json();
                setConfigs(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (key: string, accountCode: string, label: string, module: string) => {
        try {
            const res = await fetch('/api/admin/accounting/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, accountCode, label, module })
            });

            if (res.ok) {
                setMessage('Guardado exitosamente');
                fetchConfigs();
                setTimeout(() => setMessage(''), 3000);
            } else {
                setMessage('Error al guardar');
            }
        } catch (e) {
            setMessage('Error de conexión');
        }
    };

    const getValue = (key: string) => {
        const found = configs.find(c => c.key === key);
        return found ? found.accountCode : '';
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Cuentas Contables (PUC)</h1>
                <p className="text-slate-500">Configure qué cuenta del PUC se afecta con cada operación del sistema.</p>
            </header>

            {message && <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">{message}</div>}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600">Concepto</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Módulo</th>
                            <th className="px-6 py-4 font-bold text-slate-600">Cuenta PUC</th>
                            <th className="px-6 py-4 text-right">Acción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {KNOWN_KEYS.map((item) => {
                            const currentValue = getValue(item.key) || item.default;
                            return (
                                <ConfigRow
                                    key={item.key}
                                    item={item}
                                    currentValue={currentValue}
                                    onSave={handleSave}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function ConfigRow({ item, currentValue, onSave }: any) {
    const [val, setVal] = useState(currentValue);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setVal(currentValue);
    }, [currentValue]);

    const handleChange = (e: any) => {
        setVal(e.target.value);
        setDirty(true);
    };

    const save = () => {
        onSave(item.key, val, item.label, item.module);
        setDirty(false);
    };

    return (
        <tr className="hover:bg-slate-50">
            <td className="px-6 py-4">
                <div className="font-medium text-slate-900">{item.label}</div>
                <div className="text-xs text-slate-400 font-mono">{item.key}</div>
            </td>
            <td className="px-6 py-4">
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                    {item.module}
                </span>
            </td>
            <td className="px-6 py-4">
                <input
                    type="text"
                    value={val}
                    onChange={handleChange}
                    className="border border-slate-300 rounded px-2 py-1 w-32 font-mono text-sm focus:outline-none focus:border-blue-500"
                />
            </td>
            <td className="px-6 py-4 text-right">
                {dirty && (
                    <button
                        onClick={save}
                        className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                    >
                        Guardar
                    </button>
                )}
            </td>
        </tr>
    );
}
