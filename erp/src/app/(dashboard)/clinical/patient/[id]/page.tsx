import { patientService } from '@/lib/services/patientService';
import { medicalRecordService } from '@/lib/services/medicalRecordService';
import HistoryTimeline from '@/components/clinical/HistoryTimeline';
import Link from 'next/link';

export default async function PatientDetailPage({ params }: { params: { id: string } }) {
    const patient = await patientService.getPatientById(params.id);
    const consultations = await medicalRecordService.getConsultationsByPatientId(params.id);

    if (!patient) {
        return <div className="p-4">Paciente no encontrado</div>;
    }

    return (
        <div className="patient-detail-page">
            <div className="patient-header card">
                <div className="ph-left">
                    <div className="ph-avatar">
                        {patient.firstName[0]}{patient.lastName[0]}
                    </div>
                    <div className="ph-info">
                        <h1 className="ph-name">{patient.firstName} {patient.lastName}</h1>
                        <div className="ph-meta">
                            <span>{patient.documentType} {patient.documentNumber}</span>
                            <span>•</span>
                            <span>{calculateAge(patient.dateOfBirth)} años</span>
                            <span>•</span>
                            <span>EPS: {patient.eps}</span>
                        </div>
                    </div>
                </div>
                <div className="ph-actions">
                    <Link href={`/clinical/consultation/${patient.id}`} className="btn btn-primary">
                        + Nueva Consulta
                    </Link>
                </div>
            </div>

            <div className="history-section">
                <h3 className="section-title">Historia Clínica</h3>
                <HistoryTimeline consultations={consultations} />
            </div>

            {/* Styles moved to globals.css later to avoid hydration mismatch/server component issues */}
        </div>
    );
}

function calculateAge(dob: string) {
    const diff = Date.now() - new Date(dob).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
