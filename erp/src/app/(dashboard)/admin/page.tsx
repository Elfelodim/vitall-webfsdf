import Link from 'next/link';

export default function AdminPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Panel de Administración</h1>
            <p className="text-slate-500 mb-8">Configuración general y parámetros del sistema</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/admin/cups" className="group bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-blue-400">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <span className="text-3xl">🩺</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Procedimientos (CUPS)</h3>
                    <p className="text-blue-100 text-sm font-medium">
                        Gestión de la Clasificación Única de Procedimientos (Res. 2706).
                    </p>
                </Link>

                <Link href="/admin/cie10" className="group bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-purple-400">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <span className="text-3xl">🧬</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Diagnósticos (CIE-10)</h3>
                    <p className="text-purple-100 text-sm font-medium">
                        Base de datos de diagnósticos internacionales.
                    </p>
                </Link>

                <Link href="/billing/config" className="group bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-indigo-400">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <span className="text-3xl">📄</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Facturación DIAN</h3>
                    <p className="text-indigo-100 text-sm font-medium">
                        Resoluciones, prefijos y numeración.
                    </p>
                </Link>

                <Link href="/admin/puc" className="group bg-gradient-to-br from-teal-500 to-teal-600 text-white p-6 rounded-2xl shadow-lg shadow-teal-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer flex flex-col items-center text-center border-t border-teal-400">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm group-hover:bg-white/30 transition-colors">
                        <span className="text-3xl">📚</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Plan de Cuentas (PUC)</h3>
                    <p className="text-teal-100 text-sm font-medium">
                        Gestión y carga masiva de cuentas contables.
                    </p>
                </Link>

                <div className="bg-slate-100 p-6 rounded-2xl border border-slate-200 flex flex-col items-center text-center grayscale opacity-70">
                    <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                        <span className="text-3xl">👥</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-500 mb-2">Usuarios</h3>
                    <p className="text-slate-400 text-sm">
                        Próximamente: Roles y permisos.
                    </p>
                </div>
            </div>
        </div>
    );
}
