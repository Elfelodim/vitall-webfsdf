export interface MipresTokenResponse {
    IdToken: string;
    Expiration: string; // Date string
}

export type AmbitoAtencion = '1' | '2' | '3'; // 1: Ambulatorio, 2: Domiciliario, 3: Urgencia/Hospitalario

export interface Medicamento {
    CodTecnologia: string; // CUM
    NombreTecnologia: string;
    Concentracion: string;
    UnidadMedida: string;
    FormaFarmaceutica: string;
    Dosis: number;
    Frecuencia: number;
    UnidadFrecuencia: number; // 1: Min, 2: Hora, 3: Dia
    Duracion: number;
    CantidadTotal: number;
    ViaAdministracion: number;
    Indicaciones: string;
}

export interface Procedimiento {
    CodTecnologia: string; // CUPS
    NombreTecnologia: string;
    Cantidad: number;
    Indicaciones: string;
}

export interface Dispositivo {
    CodTecnologia: string;
    NombreTecnologia: string;
    Cantidad: number;
    Indicaciones: string;
}

export interface GenerarPrescripcionRequest {
    NoPrescripcion?: number; // Only for PUT/Update
    FPrescripcion: string; // YYYY-MM-DD
    CodHabIPS: string;
    TipoIDPaciente: string;
    NroIDPaciente: string;
    CodAmbitoAtencion: AmbitoAtencion;
    CodDiagnosticoPrincipal: string;
    CodDiagnosticoRel1?: string;
    Medicamentos?: Medicamento[];
    Procedimientos?: Procedimiento[];
    Dispositivos?: Dispositivo[];
    scope?: 'UPC' | 'NoPBS'; // New field for Circular 044 (2025)
    // ... extensive list of other fields simplified for MVP
}

export interface PrescriptionResponse {
    NoPrescripcion: string;
    IdTransaccion: string;
    Fecha: string;
    Estado: string;
}
