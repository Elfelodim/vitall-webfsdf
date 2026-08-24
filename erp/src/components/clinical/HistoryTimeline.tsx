"use client";

import { Consultation } from '@/types/medicalRecord';

interface HistoryTimelineProps {
    consultations: Consultation[];
}

export default function HistoryTimeline({ consultations }: HistoryTimelineProps) {
    if (consultations.length === 0) {
        return <div className="empty-state">No hay historia clínica registrada.</div>;
    }

    return (
        <div className="timeline">
            {consultations.map((consultation) => (
                <div key={consultation.id} className="timeline-item">
                    <div className="timeline-date">
                        <span className="date">
                            {new Date(consultation.date).toLocaleDateString()}
                        </span>
                        <span className="time">
                            {new Date(consultation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    <div className="timeline-content card">
                        <div className="timeline-header">
                            <h4 className="doctor-name">{consultation.doctorName}</h4>
                            <span className="specialty">Medicina General</span>
                        </div>

                        <div className="consultation-summary">
                            <p><strong>Motivo:</strong> {consultation.reasonForConsultation}</p>
                            <div className="diagnosis-tags">
                                {consultation.diagnosis.map((d, idx) => (
                                    <span key={idx} className="tag">
                                        {d.code} - {d.description}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button className="btn-link">Ver Detalle Completo</button>
                    </div>
                </div>
            ))}

            <style jsx>{`
        .timeline {
          position: relative;
          padding-left: 20px;
        }

        .timeline::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 2px;
          background-color: var(--border-color);
        }

        .timeline-item {
          position: relative;
          padding-left: 32px;
          margin-bottom: 32px;
        }

        .timeline-item::before {
          content: '';
          position: absolute;
          left: -5px;
          top: 24px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background-color: var(--primary-color);
          border: 2px solid white;
          box-shadow: 0 0 0 2px var(--primary-light);
        }

        .timeline-date {
          display: flex;
          flex-direction: column;
          margin-bottom: 8px;
        }

        .date {
          font-weight: 600;
          color: var(--text-primary);
        }

        .time {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .timeline-content {
          padding: 16px;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 8px;
        }

        .doctor-name {
          font-size: 1rem;
          color: var(--primary-dark);
        }

        .specialty {
          font-size: 0.8rem;
          color: var(--text-secondary);
          background: #f1f2f6;
          padding: 2px 8px;
          border-radius: 12px;
        }

        .consultation-summary p {
          margin-bottom: 8px;
          font-size: 0.95rem;
        }

        .diagnosis-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 8px;
        }

        .tag {
          font-size: 0.8rem;
          background-color: var(--primary-light);
          color: var(--primary-color);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .btn-link {
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0;
          margin-top: 12px;
        }

        .empty-state {
          text-align: center;
          color: var(--text-secondary);
          padding: 40px;
          font-style: italic;
        }
      `}</style>
        </div>
    );
}
