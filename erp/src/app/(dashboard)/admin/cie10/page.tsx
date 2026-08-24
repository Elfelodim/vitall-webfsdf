'use client';

import { useState, useEffect } from 'react';

const COMMON_CIE10 = [
    { code: 'J00', description: 'RINOFARINGITIS AGUDA [RESFRIADO COMUN]' },
    { code: 'R51', description: 'CEFALEA' },
    { code: 'I10', description: 'HIPERTENSION ESENCIAL (PRIMARIA)' },
    { code: 'E119', description: 'DIABETES MELLITUS NO INSULINODEPENDIENTE SIN MENCION DE COMPLICACION' },
    { code: 'K297', description: 'GASTRITIS, NO ESPECIFICADA' },
    { code: 'N390', description: 'INFECCION DE VIAS URINARIAS, SITIO NO ESPECIFICADO' },
    { code: 'M545', description: 'LUMBAGO NO ESPECIFICADO' },
    { code: 'R104', description: 'OTROS DOLORES ABDOMINALES Y LOS NO ESPECIFICADOS' },
    { code: 'A09', description: 'DIARREA Y GASTROENTERITIS DE PRESUNTO ORIGEN INFECCIOSO' },
    { code: 'R05', description: 'TOS' }
];

export default function Cie10FilesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/cie10?q=${query}`);
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
        fetchData(searchTerm);
    };

    const loadCommon = async () => {
        if (!confirm('¿Desea cargar ~10 diagnósticos comunes automáticamente?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/cie10/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(COMMON_CIE10)
            });
            if (res.ok) {
                alert('Códigos cargados exitosamente');
                fetchData();
            } else {
                alert('Error al cargar códigos');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleBulkImport = async () => {
        if (!importData.trim()) return;

        let parsedData = [];
        try {
            if (importData.trim().startsWith('[')) {
                parsedData = JSON.parse(importData);
            } else {
                parsedData = importData.split('\n').filter(l => l.trim()).map(line => {
                    let parts;
                    if (line.includes('\t')) parts = line.split('\t');
                    else if (line.includes(';')) parts = line.split(';');
                    else parts = line.split(',');

                    const code = parts[0]?.trim();
                    const description = parts[1]?.trim() || 'Sin descripción';

                    if (!code || code.length < 2) return null; // CIE10 minimum length check

                    return { code, description };
                }).filter(Boolean);
            }

            if (parsedData.length === 0) {
                alert('No se encontraron datos válidos.');
                return;
            }

            setImporting(true);
            const res = await fetch('/api/admin/cie10/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedData)
            });

            if (res.ok) {
                const json = await res.json();
                alert(`Importación exitosa: ${json.count} registros.`);
                setImportModalOpen(false);
                setImportData('');
                fetchData();
            } else {
                const errorData = await res.json();
                alert(`Error en la importación: ${errorData.message || 'Desconocido'}`);
            }
        } catch (e) {
            alert('Error de formato.');
            console.error(e);
        } finally {
            setImporting(false);
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
                    .filter(row => {
                        const val = String(row[0]).toLowerCase().trim();
                        return val !== 'código' && val !== 'codigo' && val !== 'code';
                    })
                    .map(row => `${row[0]};${row[1] || ''}`)
                    .join('\n');

                setImportData(csvContent);
                alert('Archivo Excel procesado.');
            };
            reader.readAsBinaryString(file);
        } catch (error) {
            console.error(error);
            alert('Error al leer Excel.');
        }
    };

    const exportToExcel = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/cie10?limit=50000');
            if (!res.ok) throw new Error('Error al descargar');
            const allItems = await res.json();

            if (allItems.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }

            import('xlsx').then(xlsx => {
                const worksheet = xlsx.utils.json_to_sheet(allItems.map((r: any) => ({
                    Código: r.code,
                    Descripción: r.description
                })));
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet, 'CIE10');
                xlsx.writeFile(workbook, 'Listado_CIE10.xlsx');
            });
        } catch (e) {
            console.error(e);
            alert('Error al generar Excel.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Diagnósticos (CIE-10)</h1>
                    <p className="text-slate-500">Gestión de códigos internacionales de enfermedades</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            if (!confirm('⚠️ ¿ESTÁ SEGURO DE ELIMINAR TODO EL LISTADO DE CIE-10?')) return;
                            setLoading(true);
                            try {
                                await fetch('/api/admin/cie10', { method: 'DELETE' });
                                setResults([]);
                            } catch (e) { console.error(e); }
                            finally { setLoading(false); }
                        }}
                        className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 font-semibold text-sm"
                    >
                        🗑️ Limpiar Todo
                    </button>
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 border border-green-200 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 font-semibold text-sm flex items-center gap-2"
                    >
                        📊 Excel
                    </button>
                    <button
                        onClick={loadCommon}
                        className="px-4 py-2 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 font-semibold text-sm"
                    >
                        ⚡ Cargar Comunes
                    </button>
                    <button
                        onClick={() => setImportModalOpen(true)}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold"
                    >
                        📂 Importar Masivo
                    </button>
                </div>
            </header>

            <form onSubmit={handleSearch} className="mb-6 flex gap-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar código o enfermedad..."
                    className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#005f99] outline-none"
                />
                <button type="submit" className="px-6 py-3 bg-[#005f99] text-white rounded-xl font-bold hover:bg-[#004e80]">
                    Buscar
                </button>
            </form>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Código</th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Descripción</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan={2} className="px-6 py-8 text-center text-slate-500">No hay datos.</td></tr>
                        ) : (
                            results.map((item, i) => (
                                <tr key={item.id || i} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-mono text-sm text-[#005f99] font-bold">{item.code}</td>
                                    <td className="px-6 py-3 text-sm text-slate-700">{item.description}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {importModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">Importar CIE-10</h3>
                        <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Cargar desde Excel (.xlsx)</label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-[#005f99] file:text-white hover:file:bg-[#004e80]"
                                />
                                <button
                                    onClick={() => {
                                        import('xlsx').then(xlsx => {
                                            const ws = xlsx.utils.aoa_to_sheet([['Código', 'Descripción'], ['J00', 'Rinofaringitis Aguda']]);
                                            const wb = xlsx.utils.book_new();
                                            xlsx.utils.book_append_sheet(wb, ws, 'Plantilla');
                                            xlsx.writeFile(wb, 'Plantilla_CIE10.xlsx');
                                        });
                                    }}
                                    className="px-3 py-2 text-xs bg-white text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-300 shadow-sm"
                                    title="Descargar ejemplo"
                                >
                                    📥 Plantilla
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Formatos: <code>Código;Descripción</code> o JSON.
                        </p>
                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            className="w-full h-64 border border-slate-300 rounded-lg p-4 font-mono text-sm mb-4 outline-none focus:ring-2 focus:ring-[#005f99]"
                            placeholder='J00;Rinofaringitis aguda'
                        />
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setImportModalOpen(false)} className="px-4 py-2 hover:bg-slate-100 rounded-lg font-bold text-slate-600">Cancelar</button>
                            <button onClick={handleBulkImport} disabled={importing} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
                                {importing ? 'Procesando...' : 'Importar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
