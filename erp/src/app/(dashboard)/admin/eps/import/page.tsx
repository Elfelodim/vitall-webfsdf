'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useRouter } from 'next/navigation';

export default function ImportEpsPage() {
    const router = useRouter();
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const jsonData = XLSX.utils.sheet_to_json(ws);

                // Map columns loosely
                const mappedData = jsonData.map((row: any) => ({
                    code: row['CODIGO'] || row['codigo'] || row['Code'] || '',
                    name: row['NOMBRE'] || row['nombre'] || row['Name'] || '',
                    nit: row['NIT'] || row['nit'] || '',
                    regime: row['REGIMEN'] || row['regimen'] || 'Contributivo'
                })).filter(r => r.code && r.name && r.nit);

                setData(mappedData);
                setError('');
            } catch (err) {
                console.error(err);
                setError('Error al leer el archivo. Asegúrate que sea un Excel válido.');
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (data.length === 0) return;
        setLoading(true);
        try {
            const res = await fetch('/api/insurers/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                const result = await res.json();
                alert(`✅ Importación exitosa: ${result.count} registros procesados.`);
                router.push('/admin/eps');
            } else {
                throw new Error('Falló la importación en el servidor.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Importación Masiva de EPS</h1>
                <p className="text-slate-500">Sube un archivo Excel con las columnas: CODIGO, NOMBRE, NIT, REGIMEN.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow border border-slate-200 mb-8">
                <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4 font-bold">{error}</div>}

            {data.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-lg">Vista Previa ({data.length} registros)</h3>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Confirmar Importación'}
                        </button>
                    </div>
                    <div className="bg-white rounded-lg border overflow-hidden max-h-96 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 sticky top-0">
                                <tr>
                                    <th className="p-2 border-b">CODIGO</th>
                                    <th className="p-2 border-b">NIT</th>
                                    <th className="p-2 border-b">NOMBRE</th>
                                    <th className="p-2 border-b">REGIMEN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="p-2 border-b font-mono">{row.code}</td>
                                        <td className="p-2 border-b font-mono">{row.nit}</td>
                                        <td className="p-2 border-b">{row.name}</td>
                                        <td className="p-2 border-b">{row.regime}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
