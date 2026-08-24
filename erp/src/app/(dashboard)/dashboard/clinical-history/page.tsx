'use client';

import PatientList from '@/components/clinical/PatientList';

export default function ClinicalHistoryIndexPage() {
    return (
        <div className="clinical-history-index">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Historias Clínicas</h1>
                    <p className="page-subtitle">Busca y selecciona un paciente para ver su historial médico completo.</p>
                </div>
            </header>

            <div className="content-wrapper glass-panel">
                <PatientList />
            </div>

            <style jsx>{`
                .clinical-history-index {
                    padding: 2rem;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .page-header {
                    margin-bottom: 2rem;
                }

                .page-title {
                    font-size: 2rem;
                    font-weight: 800;
                    color: #2d3748;
                    margin-bottom: 0.5rem;
                }

                .page-subtitle {
                    color: #718096;
                    font-size: 1rem;
                }

                .glass-panel {
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(15px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
                    padding: 1.5rem;
                }
            `}</style>
        </div>
    );
}
