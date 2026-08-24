"use client";

import { Appointment } from '@/types/scheduling';

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
    if (appointments.length === 0) {
        return <div className="p-4 text-center text-gray-500">No hay citas programadas para hoy.</div>;
    }

    return (
        <div className="agenda-list">
            {appointments.map((apt) => (
                <div key={apt.id} className="agenda-item card">
                    <div className="time-slot">
                        <span className="start-time">{apt.startTime}</span>
                        <span className="duration">30 min</span>
                    </div>
                    <div className="apt-details">
                        <h4 className="patient-name">{apt.patientName}</h4>
                        <span className="apt-type">{apt.type}</span>
                        <div className="apt-meta">
                            <span>Dr. {apt.doctorName}</span>
                            <span className={`status ${apt.status.toLowerCase()}`}>{apt.status}</span>
                        </div>
                    </div>
                    <div className="apt-actions">
                        <button className="btn-icon">✏️</button>
                    </div>
                </div>
            ))}


        </div>
    );
}
