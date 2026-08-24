'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewAdmissionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Patient State
    const [patient, setPatient] = useState({
        documentType: 'CC',
        documentNumber: '',
        firstName: '',
        secondName: '',
        lastName: '',
        secondLastName: '',
        dateOfBirth: '',
        sex: 'M',
        zone: 'U', // Urbana
        address: '',
        phone: '',
        email: '',
        eps: '',
        regime: 'Contributivo',
        userType: 'Cotizante'
    });

    // Order State
    const [order, setOrder] = useState({
        prefix: 'ADM',
        contractType: 'Evento',
        program: 'General',
        contractId: ''
    });

    const [contracts, setContracts] = useState([]);

    // Fetch Contracts
    useState(() => {
        fetch('/api/contracts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setContracts(data);
            })
            .catch(console.error);
    });

    // Payment State
    const [includePayment, setIncludePayment] = useState(false);
    const [payment, setPayment] = useState({
        amount: 0,
        concept: 'Copago',
        paymentMethod: 'Cash',
        prefix: 'RC',
        notes: ''
    });

    const searchPatient = async () => {
        if (!patient.documentNumber) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/patients/by-document/${patient.documentNumber}`);
            if (res.ok) {
                const foundPatient = await res.json();
                // Update state with found data
                setPatient(prev => ({
                    ...prev,
                    ...foundPatient,
                    // Keep document details just in case
                    documentNumber: foundPatient.documentNumber,
                    documentType: foundPatient.documentType
                }));
                // alert('✅ Paciente encontrado');
            } else {
                // Optional: Toast "Patient not found, please fill details"
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePatient = async () => {
        if (!patient.documentNumber || !patient.firstName || !patient.lastName) {
            alert('⚠️ Por favor complete identificación y nombres.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/patients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patient)
            });
            if (res.ok) {
                alert('✅ Datos del paciente guardados/actualizados correctamente.');
            } else {
                throw new Error('Error al guardar paciente');
            }
        } catch (e: any) {
            alert('❌ ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Create Admission (Patient + Order)
            const resOrder = await fetch('/api/admissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ patient, order })
            });

            if (!resOrder.ok) throw new Error('Error al crear orden de servicio');
            const resultOrder = await resOrder.json();
            const serviceOrderId = resultOrder.serviceOrder.id;

            // Redirect to the Order Detail page to handle payments
            router.push(`/admissions/${serviceOrderId}`);
        } catch (error: any) {
            alert('❌ Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Nueva Orden de Servicio</h1>
                    <p className="page-subtitle">Ingreso de paciente y generación de consecutivos.</p>
                </div>
                <button type="button" onClick={() => router.back()} className="btn-secondary">Cancelar</button>
            </header>

            <form onSubmit={handleSubmit} className="form-grid">

                {/* 1. Datos de la Orden (ENCABEZADO) */}
                <section className="glass-panel">
                    <div className="section-title">
                        <span className="icon">📋</span>
                        <h3>Datos de la Orden</h3>
                    </div>

                    <div className="grid-3">
                        <div className="form-group">
                            <label>Prefijo Orden</label>
                            <input
                                value={order.prefix}
                                onChange={e => setOrder({ ...order, prefix: e.target.value.toUpperCase() })}
                                maxLength={4}
                                placeholder="Eje: ADM"
                                className="font-mono"
                            />
                            <small>Determina el consecutivo (Eje: ADM001)</small>
                        </div>
                        <div className="form-group">
                            <label>Contrato</label>
                            <select
                                value={order.contractId || ''}
                                onChange={e => {
                                    const selectedId = e.target.value;
                                    setOrder({
                                        ...order,
                                        contractId: selectedId,
                                        // Update program or other fields if needed
                                    })
                                }}
                            >
                                <option value="">-- Seleccionar Contrato --</option>
                                {contracts.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.clientName} - {c.manualType} {c.adjustmentPercentage !== 0 ? `(${c.adjustmentPercentage}%)` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo Contratación</label>
                            <select value={order.contractType} onChange={e => setOrder({ ...order, contractType: e.target.value })}>
                                <option value="Evento">Evento</option>
                                <option value="Capita">Cápita</option>
                                <option value="PGP">PGP</option>
                                <option value="Paquete">Paquete</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Programa</label>
                            <input value={order.program} onChange={e => setOrder({ ...order, program: e.target.value })} placeholder="Eje: Consulta Externa" />
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="section-title mt-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="icon">👤</span>
                            <h3>Datos del Paciente</h3>
                        </div>
                        <button
                            type="button"
                            onClick={handleSavePatient}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1 rounded-full border border-slate-300 transition-colors font-semibold"
                        >
                            💾 Guardar Solo Paciente
                        </button>
                    </div>

                    <div className="grid-3">
                        <div className="form-group">
                            <label>Tipo Documento</label>
                            <select
                                value={patient.documentType}
                                onChange={e => setPatient({ ...patient, documentType: e.target.value })}
                                required
                            >
                                <option value="CC">Cédula de Ciudadanía</option>
                                <option value="TI">Tarjeta de Identidad</option>
                                <option value="RC">Registro Civil</option>
                                <option value="CE">Cédula de Extranjería</option>
                                <option value="PA">Pasaporte</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Número Documento</label>
                            <input
                                required
                                value={patient.documentNumber}
                                onChange={e => setPatient({ ...patient, documentNumber: e.target.value })}
                                onBlur={searchPatient}
                                placeholder="Ingrese y presione tab..."
                            />
                        </div>
                        <div className="form-group">
                            <label>Fecha Nacimiento</label>
                            <input
                                type="date"
                                required
                                value={patient.dateOfBirth}
                                onChange={e => setPatient({ ...patient, dateOfBirth: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid-4 mt-4">
                        <div className="form-group">
                            <label>Primer Nombre</label>
                            <input required value={patient.firstName} onChange={e => setPatient({ ...patient, firstName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Segundo Nombre</label>
                            <input value={patient.secondName || ''} onChange={e => setPatient({ ...patient, secondName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Primer Apellido</label>
                            <input required value={patient.lastName} onChange={e => setPatient({ ...patient, lastName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Segundo Apellido</label>
                            <input value={patient.secondLastName || ''} onChange={e => setPatient({ ...patient, secondLastName: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid-3 mt-4">
                        <div className="form-group">
                            <label>Sexo Biológico</label>
                            <select value={patient.sex || ''} onChange={e => setPatient({ ...patient, sex: e.target.value })}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Zona Residencia</label>
                            <select value={patient.zone || ''} onChange={e => setPatient({ ...patient, zone: e.target.value })}>
                                <option value="U">Urbana</option>
                                <option value="R">Rural</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Dirección</label>
                            <input required value={patient.address || ''} onChange={e => setPatient({ ...patient, address: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid-3 mt-4">
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input required value={patient.phone} onChange={e => setPatient({ ...patient, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" value={patient.email || ''} onChange={e => setPatient({ ...patient, email: e.target.value })} />
                        </div>
                    </div>

                    <hr className="divider" />

                    <div className="grid-3 mt-4">
                        <div className="form-group">
                            <label>EPS / Aseguradora</label>
                            <input list="eps-list" required value={patient.eps} onChange={e => setPatient({ ...patient, eps: e.target.value })} placeholder="Buscar EPS..." />
                            <datalist id="eps-list">
                                <option value="SURA" />
                                <option value="SANITAS" />
                                <option value="COOMEVA" />
                                <option value="NUEVA EPS" />
                                <option value="SALUD TOTAL" />
                                <option value="PARTICULAR" />
                            </datalist>
                        </div>
                        <div className="form-group">
                            <label>Régimen</label>
                            <select value={patient.regime || ''} onChange={e => setPatient({ ...patient, regime: e.target.value })}>
                                <option value="Contributivo">Contributivo</option>
                                <option value="Subsidiado">Subsidiado</option>
                                <option value="Vinculado">Vinculado</option>
                                <option value="Particular">Particular</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Tipo Usuario</label>
                            <select value={patient.userType || ''} onChange={e => setPatient({ ...patient, userType: e.target.value })}>
                                <option value="Cotizante">Cotizante</option>
                                <option value="Beneficiario">Beneficiario</option>
                                <option value="Adicional">Adicional</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div className="form-actions">
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Procesando...' : '💾 Crear Admisión'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                .page-container {
                    padding: 2rem;
                    max-width: 1200px;
                    margin: 0 auto;
                    font-family: 'Inter', sans-serif;
                }
                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #1e293b;
                    margin-bottom: 0.25rem;
                }
                .page-subtitle { color: #64748b; }
                
                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(20px);
                    border: 1px solid white;
                    border-radius: 20px;
                    padding: 2rem;
                    margin-bottom: 2rem;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                }
                .active-border {
                    border: 2px solid #10b981;
                }

                .section-title {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }
                .section-title h3 {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 0;
                }
                .icon { font-size: 1.5rem; }

                .section-header-check {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .mt-4 { margin-top: 1.5rem; }

                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                .form-group label {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: #475569;
                }
                input, select {
                    padding: 0.75rem;
                    border: 1px solid #cbd5e1;
                    border-radius: 8px;
                    font-size: 1rem;
                    background: #f8fafc;
                }
                input:focus, select:focus {
                    outline: none;
                    border-color: #2563eb;
                    background: white;
                }
                .font-mono { font-family: monospace; font-weight: 700; }
                .money-input { font-weight: 700; color: #10b981; font-size: 1.1rem; }
                
                .divider { margin: 2rem 0; border: none; border-top: 1px dashed #e2e8f0; }

                /* Switch Toggle */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 28px;
                }
                .switch input { opacity: 0; width: 0; height: 0; }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                }
                input:checked + .slider { background-color: #10b981; }
                input:checked + .slider:before { transform: translateX(22px); }
                .slider.round { border-radius: 34px; }
                .slider.round:before { border-radius: 50%; }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 2rem;
                }
                .btn-submit {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 1rem 3rem;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
                    transition: all 0.2s;
                }
                .btn-submit:hover {
                    transform: translateY(-2px);
                    background: #1d4ed8;
                }
                .btn-secondary {
                    background: transparent;
                    border: 2px solid #e2e8f0;
                    color: #64748b;
                    padding: 0.5rem 1.5rem;
                    border-radius: 8px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .fade-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div >
    );
}
