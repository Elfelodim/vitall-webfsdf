'use client';

import { useState, useEffect } from 'react';

export default function PucManagementPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async (query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/puc?q=${query}`);
            if (res.ok) {
                setResults(await res.json());
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchAccounts(searchTerm);
    };

    const inferType = (code: string): string => {
        // PUC Colombia first digit logic
        const firstDigit = code.charAt(0);
        switch (firstDigit) {
            case '1': return 'Activo';
            case '2': return 'Pasivo';
            case '3': return 'Patrimonio';
            case '4': return 'Ingresos';
            case '5': return 'Gastos';
            case '6': return 'Costos de Venta';
            case '7': return 'Costos de Producción';
            case '8': return 'Cuentas de Orden Deudoras';
            case '9': return 'Cuentas de Orden Acreedoras';
            default: return 'Otro';
        }
    };

    const handleBulkImport = async () => {
        if (!importData.trim()) return;

        let parsedData = [];
        try {
            if (importData.trim().startsWith('[')) {
                parsedData = JSON.parse(importData);
            } else {
                // CSV: Code;Name
                parsedData = importData.split('\n').filter(l => l.trim()).map(line => {
                    let parts;
                    if (line.includes('\t')) parts = line.split('\t');
                    else if (line.includes(';')) parts = line.split(';');
                    else parts = line.split(',');

                    const code = parts[0]?.trim();
                    const name = parts[1]?.trim() || 'Cuenta Sin Nombre';

                    if (!code) return null;

                    return {
                        code,
                        name,
                        type: inferType(code),
                        balance: 0
                    };
                }).filter(Boolean);
            }

            if (parsedData.length === 0) {
                alert('No se encontraron datos válidos.');
                return;
            }

            setImporting(true);
            const res = await fetch('/api/admin/puc/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedData)
            });

            if (res.ok) {
                const json = await res.json();
                alert(`Importación exitosa: ${json.count || 'N/A'} cuentas.`);
                setImportModalOpen(false);
                setImportData('');
                fetchAccounts();
            } else {
                alert('Error en la importación. Verifique códigos duplicados.');
            }

        } catch (e) {
            alert('Error al procesar los datos.');
            console.error(e);
        } finally {
            setImporting(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`¿Eliminar la cuenta ${code}?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/puc?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAccounts(searchTerm);
            } else {
                alert('Error al eliminar');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const xlsx = await import('xlsx');
            const reader = new FileReader();

            reader.onload = (evt) => {
                const bstr = evt.target?.result;
                const wb = xlsx.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = xlsx.utils.sheet_to_json(ws, { header: 1 }) as any[][];

                const csvContent = data
                    .filter(row => row[0])
                    // Filter Header Row
                    .filter(row => {
                        const val = String(row[0]).toLowerCase().trim();
                        return val !== 'código' && val !== 'codigo' && val !== 'code';
                    })
                    .map(row => `${row[0]};${row[1] || ''}`)
                    .join('\n');

                setImportData(csvContent);
                alert('Archivo procesado (Encabezados eliminados si existían).');
            };

            reader.readAsBinaryString(file);
        } catch (error) {
            console.error(error);
            alert('Error al leer el archivo Excel.');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Plan Único de Cuentas (PUC)</h1>
                    <p className="text-slate-500">Gestión de códigos contables y jerarquía.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold flex items-center gap-2 shadow-lg shadow-teal-200"
                    >
                        📂 Carga Masiva (Excel/CSV)
                    </button>
                </div>
            </header>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar cuenta por código o nombre..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <button type="submit" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">
                    Buscar
                </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Código</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Nombre de Cuenta</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Clase (Tipo)</th>
                            <th className="px-6 py-4 text-right text-sm font-bold text-slate-600">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No se encontraron cuentas.</td></tr>
                        ) : (
                            results.map((acc, i) => (
                                <tr key={acc.id || i} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-3 font-mono text-sm text-teal-700 font-bold">{acc.code}</td>
                                    <td className="px-6 py-3 text-sm text-slate-700">{acc.name}</td>
                                    <td className="px-6 py-3 text-sm text-slate-500">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${acc.type === 'Activo' ? 'bg-green-100 text-green-700' :
                                            acc.type === 'Pasivo' ? 'bg-red-100 text-red-700' :
                                                acc.type === 'Patrimonio' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {acc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(acc.id, acc.code)}
                                            className="text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Eliminar cuenta"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Import Modal */}
            {importModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Opción A: Subir Excel (.xlsx, .xls)</label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-slate-500
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-teal-50 file:text-teal-700
                                    hover:file:bg-teal-100"
                                />
                                <button
                                    onClick={() => {
                                        import('xlsx').then(xlsx => {
                                            const ws = xlsx.utils.aoa_to_sheet([['Código', 'Nombre'], ['110505', 'Caja General']]);
                                            const wb = xlsx.utils.book_new();
                                            xlsx.utils.book_append_sheet(wb, ws, 'Plantilla');
                                            xlsx.writeFile(wb, 'Plantilla_PUC.xlsx');
                                        });
                                    }}
                                    className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-300"
                                    title="Descargar ejemplo"
                                >
                                    📥 Plantilla
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-slate-500 mb-2 font-bold">Opción B: Pegar datos manuales</p>
                        <p className="text-sm text-slate-500 mb-4">
                            Pegue aquí los códigos y nombres. El sistema detectará automáticamente el tipo.
                            <br />
                            Formato: <code>Código;Nombre</code>
                        </p>

                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            className="w-full h-64 border border-slate-300 rounded-lg p-4 font-mono text-sm mb-4 focus:ring-2 focus:ring-teal-500 outline-none"
                            placeholder='Ejemplo: 
110505;Caja General
130505;Clientes Nacionales'
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setImportModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleBulkImport}
                                disabled={importing}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-bold disabled:opacity-50"
                            >
                                {importing ? 'Procesando...' : 'Cargar Cuentas'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
