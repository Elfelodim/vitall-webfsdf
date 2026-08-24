import { schedulingService } from '@/lib/services/schedulingService';

export default async function SurgeryPage() {
    const surgeries = await schedulingService.getSurgeries();
    const rooms = await schedulingService.getOperatingRooms();

    return (
        <div className="surgery-page">
            <div className="page-header">
                <h1 className="page-title">Centro Quirúrgico</h1>
                <p className="page-subtitle">Programación y gestión de quirófanos.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }}>+ Programar Cirugía</button>
            </div>

            <div className="rooms-grid">
                {rooms.map(room => (
                    <div key={room.id} className={`room-card ${room.status.toLowerCase()}`}>
                        <h3 className="room-name">{room.name}</h3>
                        <span className="room-status">{room.status === 'Available' ? 'Disponible' : room.status === 'Occupied' ? 'Ocupado' : 'Mantenimiento'}</span>
                    </div>
                ))}
            </div>

            <div className="surgery-list card" style={{ marginTop: '32px', padding: '0' }}>
                <div className="list-header" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 className="fs-title" style={{ margin: 0 }}>Procedimientos Programados</h3>
                </div>
                <table className="patients-table">
                    <thead>
                        <tr>
                            <th>Hora</th>
                            <th>Paciente</th>
                            <th>Procedimiento</th>
                            <th>Cirujano</th>
                            <th>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {surgeries.map(surg => (
                            <tr key={surg.id}>
                                <td>08:00 AM</td>
                                <td>{surg.patientName}</td>
                                <td>{surg.procedureName}</td>
                                <td>{surg.surgeonName}</td>
                                <td><span className={`status-badge ${surg.status.toLowerCase()}`}>{surg.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>


        </div>
    );
}
