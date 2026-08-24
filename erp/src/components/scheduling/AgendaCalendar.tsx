'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/types/scheduling';

interface Doctor {
    id: string;
    name: string;
}

interface FreeSpace {
    start: string;
    end: string;
    label: string;
}

const AGENDA_TYPES = [
    'Consulta General',
    'Cirugía',
    'Cita Extra',
    'Agenda Privada',
    'Especialista',
    'Procedimiento'
];

export default function AgendaCalendar() {
    // Configuration State
    const [isConfigured, setIsConfigured] = useState(false);
    const [config, setConfig] = useState({
        date: new Date().toISOString().split('T')[0],
        doctorId: '',
        doctorName: '',
        interval: 20,
        agendaType: 'Consulta General',
        freeSpaces: [] as FreeSpace[]
    });

    // Calendar State
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

    useEffect(() => {
        // Fetch doctors
        setDoctors([
            { id: 'doc1', name: 'Dr. Alejandro Gomez' },
            { id: 'doc2', name: 'Dra. Martha Restrepo' },
            { id: 'doc3', name: 'Dr. Julian Castro' }
        ]);
    }, []);

    useEffect(() => {
        if (isConfigured) {
            fetchAppointments();
        }
    }, [isConfigured, config.date, config.doctorId]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/agenda?date=${config.date}&doctorId=${config.doctorId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setAppointments(data);
            } else {
                setAppointments([]);
            }
        } catch (err) {
            console.error('Error fetching appointments:', err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStartAgenda = () => {
        if (!config.doctorId) {
            alert('Por favor seleccione un médico');
            return;
        }
        if (config.interval <= 0) {
            alert('El intervalo debe ser mayor a 0');
            return;
        }
        // Final clamp check
        if (config.agendaType !== 'Cirugía' && config.interval > 120) {
            alert('El intervalo máximo para este tipo de agenda es de 120 minutos');
            return;
        }
        setIsConfigured(true);
    };

    const addFreeSpace = () => {
        if (config.freeSpaces.length < 3) {
            setConfig({
                ...config,
                freeSpaces: [...config.freeSpaces, { start: '13:00', end: '14:00', label: 'Descanso' }]
            });
        }
    };

    const removeFreeSpace = (index: number) => {
        const newSpaces = [...config.freeSpaces];
        newSpaces.splice(index, 1);
        setConfig({ ...config, freeSpaces: newSpaces });
    };

    const updateFreeSpace = (index: number, field: keyof FreeSpace, value: string) => {
        const newSpaces = [...config.freeSpaces];
        newSpaces[index] = { ...newSpaces[index], [field]: value };
        setConfig({ ...config, freeSpaces: newSpaces });
    };

    // Adjusted increment calculation
    const getIntervalMinutes = () => {
        return config.agendaType === 'Cirugía' ? config.interval * 60 : config.interval;
    };

    // Generate intervals based on config
    const timeSlots: string[] = [];
    if (isConfigured) {
        const intervalInMin = getIntervalMinutes();
        const startMin = 6 * 60; // 6:00
        const endMin = 22 * 60; // 22:00

        for (let current = startMin; current <= endMin; current += intervalInMin) {
            const h = Math.floor(current / 60).toString().padStart(2, '0');
            const m = (current % 60).toString().padStart(2, '0');
            timeSlots.push(`${h}:${m}`);
        }
    }

    const getAptStartingAt = (time: string) => {
        return Array.isArray(appointments) ? appointments.find(apt => apt.startTime === time) : null;
    };

    const isSlotWithinApt = (time: string) => {
        if (!Array.isArray(appointments)) return false;
        return appointments.some(apt => time >= apt.startTime && time < apt.endTime);
    };

    const getAptSpan = (apt: Appointment) => {
        const [h1, m1] = apt.startTime.split(':').map(Number);
        const [h2, m2] = apt.endTime.split(':').map(Number);
        const totalMin = (h2 * 60 + m2) - (h1 * 60 + m1);
        return Math.ceil(totalMin / getIntervalMinutes());
    };

    const getFreeSpaceAt = (time: string) => {
        return config.freeSpaces.find(fs => time >= fs.start && time < fs.end);
    };

    if (!isConfigured) {
        return (
            <div className="setup-panel glass-panel">
                <div className="setup-header">
                    <h2>Configuración de Agenda</h2>
                    <p>Establezca los parámetros de visualización y gestión para el día.</p>
                </div>

                <div className="setup-form">
                    <div className="setup-row">
                        <div className="setup-field">
                            <label>Fecha</label>
                            <input type="date" value={config.date} onChange={e => setConfig({ ...config, date: e.target.value })} />
                        </div>
                        <div className="setup-field">
                            <label>Profesional</label>
                            <select
                                value={config.doctorId}
                                onChange={e => {
                                    const doc = doctors.find(d => d.id === e.target.value);
                                    setConfig({ ...config, doctorId: e.target.value, doctorName: doc?.name || '' });
                                }}
                            >
                                <option value="">Seleccione...</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="setup-divider"></div>

                    <div className="setup-row">
                        <div className="setup-field">
                            <label>Tipo de Gestión</label>
                            <select
                                value={config.agendaType}
                                onChange={e => {
                                    const newType = e.target.value;
                                    const newInterval = newType === 'Cirugía' ? 1 : 20;
                                    setConfig({ ...config, agendaType: newType, interval: newInterval });
                                }}
                            >
                                {AGENDA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div className="setup-field">
                            <label>
                                {config.agendaType === 'Cirugía' ? 'Intervalo (Horas ilimitadas)' : 'Intervalo (Máx 120 min)'}
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={config.agendaType === 'Cirugía' ? undefined : 120}
                                value={config.interval}
                                onChange={e => {
                                    let val = parseInt(e.target.value) || 0;
                                    if (config.agendaType !== 'Cirugía' && val > 120) val = 120;
                                    setConfig({ ...config, interval: val });
                                }}
                            />
                        </div>
                    </div>

                    <div className="free-spaces-section">
                        <div className="section-header">
                            <label>Espacios Libres / Descansos (Máx 3)</label>
                            {config.freeSpaces.length < 3 && (
                                <button className="add-fs-btn" onClick={addFreeSpace}>+ Agregar</button>
                            )}
                        </div>
                        {config.freeSpaces.map((fs, idx) => (
                            <div key={idx} className="fs-row">
                                <input type="text" placeholder="Etiq. ej: Almuerzo" value={fs.label} onChange={e => updateFreeSpace(idx, 'label', e.target.value)} />
                                <input type="time" value={fs.start} onChange={e => updateFreeSpace(idx, 'start', e.target.value)} />
                                <span className="sep">a</span>
                                <input type="time" value={fs.end} onChange={e => updateFreeSpace(idx, 'end', e.target.value)} />
                                <button className="rm-fs-btn" onClick={() => removeFreeSpace(idx)}>✕</button>
                            </div>
                        ))}
                    </div>

                    <button className="start-btn" onClick={handleStartAgenda}>
                        Generar Agenda
                    </button>
                </div>

                <style jsx>{`
                    .setup-panel { max-width: 650px; margin: 40px auto; padding: 3rem; border-radius: 24px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
                    .setup-header { margin-bottom: 2.5rem; text-align: center; }
                    .setup-header h2 { font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; letter-spacing: -0.025em; }
                    .setup-header p { color: #64748b; font-size: 0.95rem; }
                    .setup-form { display: flex; flex-direction: column; gap: 1.5rem; }
                    .setup-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                    .setup-field { display: flex; flex-direction: column; gap: 0.5rem; }
                    .setup-divider { height: 1px; background: #f1f5f9; margin: 0.5rem 0; }
                    label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; }
                    input, select { padding: 0.875rem 1rem; border: 2px solid #f1f5f9; border-radius: 12px; font-size: 1rem; background: #f8fafc; transition: all 0.2s; }
                    input:focus, select:focus { border-color: #0ea5e9; background: white; outline: none; }
                    
                    .free-spaces-section { display: flex; flex-direction: column; gap: 0.75rem; background: #f8fafc; padding: 1.5rem; border-radius: 16px; border: 1px solid #f1f5f9; }
                    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
                    .add-fs-btn { background: #0ea5e9; color: white; border: none; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; }
                    .fs-row { display: flex; align-items: center; gap: 0.75rem; }
                    .fs-row input { padding: 0.5rem; font-size: 0.85rem; }
                    .sep { color: #94a3b8; font-weight: 600; font-size: 0.8rem; }
                    .rm-fs-btn { background: #fee2e2; color: #ef4444; border: none; width: 28px; height: 28px; border-radius: 50%; font-size: 0.7rem; cursor: pointer; }

                    .start-btn { margin-top: 1rem; background: #0ea5e9; color: white; padding: 1rem; border-radius: 12px; font-weight: 800; border: none; cursor: pointer; box-shadow: 0 10px 15px -3px rgba(14, 165, 233, 0.3); transition: transform 0.2s; }
                    .start-btn:hover { transform: translateY(-2px); }
                `}</style>
            </div>
        );
    }

    return (
        <div className="agenda-container">
            <div className="agenda-header-info glass-panel">
                <div className="config-summary">
                    <span className="badge-type">{config.agendaType}</span>
                    <span className="summary-item"><span className="icon">🗓️</span> {config.date}</span>
                    <span className="summary-item"><span className="icon">👨‍⚕️</span> {config.doctorName}</span>
                    <span className="summary-item"><span className="icon">⏱️</span> {config.interval}{config.agendaType === 'Cirugía' ? 'h' : 'm'}</span>
                    {config.freeSpaces.length > 0 && (
                        <span className="summary-item breaks"><span className="icon">☕</span> {config.freeSpaces.length} Descansos</span>
                    )}
                </div>
                <div className="header-actions">
                    {loading && <span className="sync-status">Sincronizando...</span>}
                    <button className="config-btn" onClick={() => setIsConfigured(false)}>Configurar Agenda</button>
                </div>
            </div>

            <div className="calendar-grid glass-panel">
                <div className="timeline-wrapper">
                    {timeSlots.map(time => {
                        const apt = getAptStartingAt(time);
                        const isUnderApt = isSlotWithinApt(time) && !apt;
                        const freeSpace = getFreeSpaceAt(time);

                        if (isUnderApt) return null;

                        return (
                            <div key={time} className={`time-row ${freeSpace ? 'break-period' : ''}`}>
                                <div className="time-display">{time}</div>
                                <div
                                    className={`slot-interaction ${apt ? 'has-appointment' : freeSpace ? 'is-blocked' : 'is-available'}`}
                                    onClick={() => {
                                        if (apt || freeSpace) return;
                                        setSelectedSlot({ start: time, end: '' });
                                        setShowModal(true);
                                    }}
                                >
                                    {apt && (
                                        <div
                                            className="appointment-card"
                                            style={{
                                                height: `calc(${getAptSpan(apt)} * 60px + (${getAptSpan(apt)} - 1) * 1px)`,
                                                zIndex: 10
                                            }}
                                        >
                                            <div className="card-content">
                                                <div className="patient-name">{(apt as any).patient?.firstName} {(apt as any).patient?.lastName}</div>
                                                <div className="time-span">{apt.startTime} - {apt.endTime}</div>
                                                <div className="apt-category">{apt.type}</div>
                                            </div>
                                        </div>
                                    )}
                                    {!apt && freeSpace && (
                                        <div className="break-label">
                                            <span className="label">🚫 {freeSpace.label}</span>
                                            <span className="times">({freeSpace.start} - {freeSpace.end})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showModal && selectedSlot && (
                <NewAppointmentModal
                    slot={selectedSlot}
                    date={config.date}
                    doctorId={config.doctorId}
                    doctorName={config.doctorName}
                    defaultType={config.agendaType}
                    freeSpaces={config.freeSpaces}
                    isSurgery={config.agendaType === 'Cirugía'}
                    onClose={() => { setShowModal(false); setSelectedSlot(null); }}
                    onSave={() => { setShowModal(false); setSelectedSlot(null); fetchAppointments(); }}
                />
            )}

            <style jsx>{`
                .agenda-container { display: flex; flex-direction: column; gap: 1.5rem; }
                
                .agenda-header-info { 
                    display: flex; justify-content: space-between; align-items: center; 
                    padding: 1rem 2rem; background: white; border-radius: 20px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;
                }
                
                .config-summary { display: flex; align-items: center; gap: 1.5rem; }
                .badge-type { 
                    background: #e0f2fe; color: #0369a1; padding: 8px 18px; 
                    border-radius: 12px; font-weight: 800; font-size: 0.8rem; 
                    text-transform: uppercase; letter-spacing: 0.05em;
                }
                .summary-item { 
                    display: flex; align-items: center; gap: 8px; 
                    font-weight: 700; color: #475569; font-size: 0.95rem; 
                }
                .icon { font-size: 1.1rem; }
                .breaks { color: #f59e0b; }
                
                .header-actions { display: flex; align-items: center; gap: 1.5rem; }
                .sync-status { font-size: 0.8rem; color: #0ea5e9; font-weight: 800; }
                .config-btn { 
                    background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 20px; 
                    border-radius: 12px; font-weight: 800; color: #64748b; 
                    cursor: pointer; transition: all 0.2s; 
                }
                .config-btn:hover { background: #f1f5f9; color: #0f172a; border-color: #cbd5e1; }

                .calendar-grid { background: white; border-radius: 24px; border: 1px solid #f1f5f9; max-height: 750px; overflow-y: auto; box-shadow: 0 4px 20px rgba(0,0,0,0.02); }
                .timeline-wrapper { display: flex; flex-direction: column; }
                .time-row { display: flex; border-bottom: 1px solid #f8fafc; min-height: 60px; }
                .break-period { background: #fefce8; }
                .time-display { 
                    width: 100px; font-size: 0.85rem; font-weight: 800; color: #94a3b8; 
                    background: #fbfcfd; border-right: 1px solid #f8fafc; 
                    display: flex; align-items: center; justify-content: center;
                }
                .slot-interaction { flex: 1; position: relative; cursor: pointer; }
                .slot-interaction.is-available:hover { background: #fbfcfd; }
                .slot-interaction.is-blocked { background: #fcfcfc; cursor: not-allowed; display: flex; align-items: center; padding-left: 30px; }

                .appointment-card { 
                    position: absolute; top: 4px; left: 8px; right: 8px; 
                    background: #f0f9ff; border-left: 6px solid #0ea5e9; 
                    border-radius: 12px; padding: 12px;
                    box-shadow: 0 8px 16px rgba(14, 165, 233, 0.1); 
                    transition: transform 0.2s;
                }
                .appointment-card:hover { transform: scale(1.005); }
                .patient-name { font-weight: 800; color: #0369a1; font-size: 1rem; margin-bottom: 2px; }
                .time-span { font-size: 0.8rem; color: #0ea5e9; font-weight: 700; }
                .apt-category { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-top: 4px; }

                .break-label { display: flex; flex-direction: column; gap: 2px; }
                .break-label .label { color: #94a3b8; font-weight: 800; font-size: 0.85rem; }
                .break-label .times { font-size: 0.7rem; color: #cbd5e1; font-weight: 700; }
            `}</style>
        </div>
    );
}

function NewAppointmentModal({ slot, date, doctorId, doctorName, defaultType, freeSpaces, isSurgery, onClose, onSave }: any) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        patientDocument: '',
        type: defaultType || 'General',
        notes: '',
        duration: isSurgery ? 1 : 30
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const [h, m] = slot.start.split(':').map(Number);
            const durationInMin = isSurgery ? form.duration * 60 : form.duration;
            const totalMin = h * 60 + m + Number(durationInMin);
            const endHour = Math.floor(totalMin / 60).toString().padStart(2, '0');
            const endMin = (totalMin % 60).toString().padStart(2, '0');
            const endTime = `${endHour}:${endMin}`;

            // Check overlap with free spaces
            const overlapsFS = freeSpaces.some((fs: FreeSpace) => {
                return (slot.start < fs.end && endTime > fs.start);
            });

            if (overlapsFS) {
                throw new Error('La cita se cruza con un descanso configurado.');
            }

            const res = await fetch('/api/agenda', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    date,
                    doctorId,
                    doctorName,
                    startTime: slot.start,
                    endTime: endTime,
                    status: 'Scheduled'
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Error al agendar');
            }

            onSave();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-effect">
                <div className="modal-header">
                    <h3>{isSurgery ? 'Nueva Cirugía' : 'Nueva Cita Médica'}</h3>
                    <p className="subtitle">Gestión de slot para {doctorName}</p>
                </div>

                <div className="slot-info">
                    <span className="info-tag">🗓️ {date}</span>
                    <span className="info-tag">🕒 {slot.start}</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Documento Paciente</label>
                        <input required value={form.patientDocument} onChange={e => setForm({ ...form, patientDocument: e.target.value })} placeholder="Identificación..." />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Gestión</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                                {AGENDA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Duración {isSurgery ? '(Horas)' : '(Minutos)'}</label>
                            <input type="number" min="1" step={isSurgery ? "0.5" : "1"} value={form.duration} onChange={e => setForm({ ...form, duration: parseFloat(e.target.value) || 0 })} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Observaciones</label>
                        <textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Notas adicionales..." />
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <div className="modal-footer">
                        <button type="button" onClick={onClose} className="btn-cancel">Cancelar</button>
                        <button type="submit" disabled={loading} className="btn-save">
                            {loading ? 'Procesando...' : 'Confirmar Agenda'}
                        </button>
                    </div>
                </form>
            </div>
            <style jsx>{`
                .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
                .modal-content { background: white; padding: 2.5rem; border-radius: 28px; width: 500px; box-shadow: 0 30px 60px rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.2); }
                .modal-header { margin-bottom: 1.5rem; }
                h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px; }
                .subtitle { color: #64748b; font-size: 0.9rem; font-weight: 600; }
                
                .slot-info { display: flex; gap: 1rem; margin-bottom: 2rem; }
                .info-tag { background: #f1f5f9; color: #475569; padding: 6px 14px; border-radius: 10px; font-weight: 700; font-size: 0.85rem; }

                form { display: flex; flex-direction: column; gap: 1.25rem; }
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
                .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
                label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
                input, select, textarea { 
                    padding: 0.875rem 1rem; border: 2px solid #f1f5f9; border-radius: 14px; 
                    font-weight: 600; font-size: 0.95rem; background: #f8fafc; transition: all 0.2s; 
                }
                input:focus, select:focus, textarea:focus { border-color: #0ea5e9; background: white; outline: none; }

                .error-box { background: #fff1f2; color: #e11d48; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; font-weight: 700; text-align: center; }
                
                .modal-footer { display: flex; gap: 1rem; margin-top: 1rem; }
                .btn-save { flex: 2; background: #0ea5e9; color: white; border: none; padding: 1rem; border-radius: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 15px rgba(14, 165, 233, 0.2); }
                .btn-save:hover { transform: translateY(-1px); }
                .btn-cancel { flex: 1; background: #f1f5f9; border: none; color: #64748b; font-weight: 700; padding: 1rem; border-radius: 14px; cursor: pointer; }
            `}</style>
        </div>
    );
}
