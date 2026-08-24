"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DOCUMENT_TYPES, DocumentType } from '@/types/patient';

export default function NewPatientPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        documentType: 'CC' as DocumentType,
        documentNumber: '',
        dateOfBirth: '',
        sex: 'M',
        address: '',
        phone: '',
        email: '',
        eps: '',
        regime: 'Contributivo'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('/api/patients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    sex: formData.sex as 'M' | 'F',
                    regime: formData.regime as 'Contributivo' | 'Subsidiado' | 'Especial',
                    status: 'Active'
                }),
            });

            if (!response.ok) {
                throw new Error('Error al crear el paciente');
            }

            router.push('/clinical');
        } catch (error) {
            console.error(error);
            alert('Error creating patient');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h1 className="title">Nuevo Ingreso de Paciente</h1>
                <p className="subtitle">Complete la información básica para el registro de admisión.</p>
            </div>

            <form onSubmit={handleSubmit} className="patient-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Tipo Documento</label>
                        <select name="documentType" value={formData.documentType} onChange={handleChange}>
                            {DOCUMENT_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Número Documento</label>
                        <input type="text" name="documentNumber" required value={formData.documentNumber} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Nombres</label>
                        <input type="text" name="firstName" required value={formData.firstName} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Apellidos</label>
                        <input type="text" name="lastName" required value={formData.lastName} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Fecha Nacimiento</label>
                        <input type="date" name="dateOfBirth" required value={formData.dateOfBirth} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Sexo</label>
                        <select name="sex" value={formData.sex} onChange={handleChange}>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                        </select>
                    </div>

                    <div className="form-group full-width">
                        <label>Dirección Residencia</label>
                        <input type="text" name="address" required value={formData.address} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Teléfono</label>
                        <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>EPS</label>
                        <input type="text" name="eps" required placeholder="Ej: Sura, Sanitas" value={formData.eps} onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Régimen</label>
                        <select name="regime" value={formData.regime} onChange={handleChange}>
                            <option value="Contributivo">Contributivo</option>
                            <option value="Subsidiado">Subsidiado</option>
                            <option value="Especial">Especial</option>
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn" onClick={() => router.back()}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Guardando...' : 'Registrar Paciente'}
                    </button>
                </div>
            </form>


        </div>
    );
}
