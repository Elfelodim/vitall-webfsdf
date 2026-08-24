export type AppointmentType = 'General' | 'Specialist' | 'Surgery' | 'Checkup';
export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface Appointment {
    id: string;
    patientDocument: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    date: string; // ISO Date String
    startTime: string; // "HH:mm"
    endTime: string; // "HH:mm"
    type: AppointmentType;
    status: AppointmentStatus;
    notes?: string;
}

export interface OperatingRoom {
    id: string;
    name: string; // e.g. "Quirófano 1"
    status: 'Available' | 'Occupied' | 'Maintenance';
}

export interface SurgeryRequest {
    id: string;
    patientId: string;
    patientName: string;
    surgeonId: string;
    surgeonName: string;
    procedureCode: string; // CIE-10 / CUPS
    procedureName: string;
    urgency: 'Elective' | 'Urgent' | 'Emergency';
    requestedDate: string;
    status: 'Pending' | 'Approved' | 'Scheduled' | 'Completed';
    operatingRoomId?: string;
}
