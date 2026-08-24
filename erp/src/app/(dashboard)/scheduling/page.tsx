'use client';

import AgendaCalendar from '@/components/scheduling/AgendaCalendar';

export default function AdminSchedulingPage() {
    return (
        <div className="scheduling-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Agenda Médica</h1>
                    <p className="page-subtitle">Gestión inteligente de citas y disponibilidad profesional.</p>
                </div>
            </header>

            <div className="agenda-view">
                <AgendaCalendar />
            </div>

            <style jsx>{`
                .scheduling-page {
                    padding: 2rem;
                    background: #f8fafc;
                    min-height: 100vh;
                }

                .page-header {
                    margin-bottom: 2.5rem;
                }

                .page-title {
                    font-size: 1.875rem;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.025em;
                }

                .page-subtitle {
                    color: #64748b;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
}
