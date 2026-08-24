'use client';

import { useState, useEffect } from 'react';

const COMMON_CUPS = [
    { code: '890201', description: 'CONSULTA DE PRIMERA VEZ POR MEDICINA GENERAL', category: 'Consulta' },
    { code: '890301', description: 'CONSULTA DE CONTROL O DE SEGUIMIENTO POR MEDICINA GENERAL', category: 'Consulta' },
    { code: '890202', description: 'CONSULTA DE PRIMERA VEZ POR MEDICINA ESPECIALIZADA', category: 'Consulta' },
    { code: '890701', description: 'CONSULTA DE URGENCIAS POR MEDICINA GENERAL', category: 'Urgencias' },
    { code: '902210', description: 'HEMOGRAMA IV (HEMOGRAMA COMPLETO)', category: 'Laboratorio' },
    { code: '903825', description: 'CREATININA EN SUERO, ORINA O OTROS FLUIDOS', category: 'Laboratorio' },
    { code: '903841', description: 'GLUCOSA EN SUERO O OTRO FLUIDO DIFERENTE A ORINA', category: 'Laboratorio' },
    { code: '903895', description: 'NITROGENO UREICO (BUN)', category: 'Laboratorio' },
    { code: '871020', description: 'RADIOGRAFIA DE TORAX (PA O AP Y LATERAL)', category: 'Imagenología' },
    { code: '906913', description: 'PROTEINA C REACTIVA CUALITATRIVA', category: 'Laboratorio' },
];

export default function CupsFilesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [importModalOpen, setImportModalOpen] = useState(false);
    const [importData, setImportData] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        fetchCups();
    }, []);

    const fetchCups = async (query = '') => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/cups?q=${query}`);
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
        fetchCups(searchTerm);
    };

    const loadCommonCups = async () => {
        if (!confirm('¿Desea cargar los ~10 códigos más comunes automáticamente?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/admin/cups/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(COMMON_CUPS)
            });
            if (res.ok) {
                alert('Códigos cargados exitosamente');
                fetchCups();
            } else {
                alert('Error al cargar códigos');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const inferCategory = (code: string, desc: string): string => {
        const d = desc.toUpperCase();
        if (d.includes('CONSULTA') || d.includes('VALORACION') || d.includes('INTERCONSULTA')) return 'Consulta';
        if (d.includes('LABORATORIO') || d.includes('HEMOGRAMA') || d.includes('SANGRE') || d.includes('ORINA') || d.includes('CULTIVO')) return 'Laboratorio';
        if (d.includes('RADIOGRAFIA') || d.includes('TOMOGRAFIA') || d.includes('RESONANCIA') || d.includes('ECOGRAFIA') || d.includes('RAYOS X')) return 'Imagenología';
        if (d.includes('CIRUGIA') || d.includes('SUTURA') || d.includes('RESECCION') || d.includes('AMPUTACION')) return 'Cirugía';
        if (d.includes('URGENCIA')) return 'Urgencias';
        if (d.includes('TERAPIA') || d.includes('REHABILITACION')) return 'Terapias';
        if (d.includes('VACUNA') || d.includes('INMUNIZACION')) return 'Vacunación';
        if (d.includes('ODONT') || d.includes('DENTAL')) return 'Odontología';
        return 'Procedimiento';
    };

    const handleBulkImport = async () => {
        if (!importData.trim()) return;

        let parsedData = [];
        try {
            // Try parsing JSON first
            if (importData.trim().startsWith('[')) {
                parsedData = JSON.parse(importData);
            } else {
                // Parse CSV-like (Code[delimiter]Description)
                parsedData = importData.split('\n').filter(l => l.trim()).map(line => {
                    let parts;
                    // Priority check for delimiter
                    if (line.includes('\t')) parts = line.split('\t');
                    else if (line.includes(';')) parts = line.split(';');
                    else parts = line.split(',');

                    const code = parts[0]?.trim();
                    const description = parts[1]?.trim() || 'Sin descripción';

                    if (!code || code.length < 4) return null;

                    return {
                        code,
                        description,
                        category: inferCategory(code, description)
                    };
                }).filter(Boolean);
            }

            if (parsedData.length === 0) {
                alert('No se encontraron datos válidos. Use formato JSON o CSV (Código;Descripción).');
                return;
            }

            setImporting(true);
            const res = await fetch('/api/admin/cups/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parsedData)
            });

            if (res.ok) {
                const json = await res.json();
                alert(`Importación exitosa: ${json.count || 'N/A'} registros.`);
                setImportModalOpen(false);
                setImportData('');
                fetchCups();
            } else {
                alert('Error en la importación masiva. Verifique los datos.');
            }

        } catch (e) {
            alert('Error al procesar los datos. Verifique el formato.');
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

                // Convert to CSV for CUPS (Code;Description)
                const csvContent = data
                    .filter(row => row[0])
                    .filter(row => {
                        const val = String(row[0]).toLowerCase().trim();
                        return val !== 'código' && val !== 'codigo' && val !== 'code';
                    })
                    .map(row => `${row[0]};${row[1] || ''}`)
                    .join('\n');

                setImportData(csvContent);
                alert('Archivo procesado. Verifique el contenido.');
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
            // Fetch ALL data for export (limit 50000)
            const res = await fetch('/api/admin/cups?limit=50000');
            if (!res.ok) throw new Error('Error al descargar datos');
            const allCups = await res.json();

            if (allCups.length === 0) {
                alert('No hay datos para exportar.');
                return;
            }

            import('xlsx').then(xlsx => {
                const worksheet = xlsx.utils.json_to_sheet(allCups.map((r: any) => ({
                    Código: r.code,
                    Descripción: r.description,
                    Categoría: r.category
                })));
                const workbook = xlsx.utils.book_new();
                xlsx.utils.book_append_sheet(workbook, worksheet, 'CUPS');
                xlsx.writeFile(workbook, 'Listado_Completo_CUPS.xlsx');
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
                    <h1 className="text-3xl font-bold text-slate-800">Procedimientos (CUPS)</h1>
                    <p className="text-slate-500">Gestión de códigos según Resolución 2706 de 2025</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={async () => {
                            if (!confirm('⚠️ ¿ESTÁ SEGURO? Esto ELIMINARÁ TODOS los procedimientos de la base de datos. Esta acción no se puede deshacer.')) return;
                            setLoading(true);
                            try {
                                const res = await fetch('/api/admin/cups', { method: 'DELETE' });
                                if (res.ok) {
                                    alert('Base de datos de CUPS limpiada exitosamente.');
                                    setResults([]);
                                }
                            } catch (e) {
                                console.error(e);
                                alert('Error al eliminar datos.');
                            } finally {
                                setLoading(false);
                            }
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
                        onClick={loadCommonCups}
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

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6 flex gap-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por código o descripción..."
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
                            <th className="px-6 py-4 text-left text-sm font-bold text-slate-600">Categoría</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Cargando...</td></tr>
                        ) : results.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No se encontraron procedimientos.</td></tr>
                        ) : (
                            results.map((cup, i) => (
                                <tr key={cup.id || i} className="hover:bg-slate-50">
                                    <td className="px-6 py-3 font-mono text-sm text-[#005f99] font-bold">{cup.code}</td>
                                    <td className="px-6 py-3 text-sm text-slate-700">{cup.description}</td>
                                    <td className="px-6 py-3 text-sm text-slate-500">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">
                                            {cup.category || 'General'}
                                        </span>
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
                        <h3 className="text-xl font-bold mb-4">Importar CUPS Masivamente</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Opción A: Subir Excel (.xlsx)</label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls, .csv"
                                    onChange={handleFileUpload}
                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                />
                                <button
                                    onClick={() => {
                                        import('xlsx').then(xlsx => {
                                            const ws = xlsx.utils.aoa_to_sheet([['Código', 'Descripción'], ['890201', 'Consulta Medicina General']]);
                                            const wb = xlsx.utils.book_new();
                                            xlsx.utils.book_append_sheet(wb, ws, 'Plantilla');
                                            xlsx.writeFile(wb, 'Plantilla_CUPS.xlsx');
                                        });
                                    }}
                                    className="px-3 py-2 text-xs bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 border border-slate-300"
                                    title="Descargar ejemplo"
                                >
                                    📥 Plantilla
                                </button>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-4">
                            Opción B: Pegue aquí el contenido en formato JSON o CSV.
                            <br />
                            Formatos soportados: <code>Código;Descripción</code> (Punto y coma) o <code>Código,Descripción</code> (Coma).
                            <br />
                            El sistema categorizará automáticamente (Ej: Consulta, Laboratorio, Imagenología).
                        </p>

                        <textarea
                            value={importData}
                            onChange={(e) => setImportData(e.target.value)}
                            className="w-full h-64 border border-slate-300 rounded-lg p-4 font-mono text-sm mb-4 focus:ring-2 focus:ring-[#005f99] outline-none"
                            placeholder='Ejemplo: 
890201;Consulta de primera vez
902210;Hemograma IV'
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
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50"
                            >
                                {importing ? 'Procesando...' : 'Procesar Importación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
