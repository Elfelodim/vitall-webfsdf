import { GenerarPrescripcionRequest, PrescriptionResponse, MipresTokenResponse } from '@/types/mipres';

const MIPRES_URL = process.env.MIPRES_URL_BASE || 'https://tablas.sispro.gov.co/WSSUMMIPRESNOPBS/api';
const PRESCRIBER_NIT = process.env.MIPRES_PRESCRIBER_NIT;
const PRESCRIBER_TOKEN = process.env.MIPRES_PRESCRIBER_TOKEN;
const SUB_KEY = process.env.MIPRES_SUBSCRIPTION_KEY || '';

export const mipresService = {
    /**
     * Authenticate with SISPRO to get a temporary session token.
     * In a real app, you should cache this token to avoid spamming the auth endpoint.
     */
    authenticate: async (): Promise<string> => {
        // Mock for development if no creds are present
        if (!PRESCRIBER_NIT || !PRESCRIBER_TOKEN) {
            console.warn('MIPRES credentials missing. Returning mock token.');
            return 'mock-mipres-token-12345';
        }

        try {
            const response = await fetch(`${MIPRES_URL}/GenerarToken/${PRESCRIBER_NIT}/${PRESCRIBER_TOKEN}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Ocp-Apim-Subscription-Key': SUB_KEY
                }
            });

            if (!response.ok) {
                throw new Error(`MIPRES Auth failed: ${response.statusText}`);
            }

            const data = await response.json();
            // Assuming the API returns the token directly as a string or defined object
            // The swagger says "string".
            return typeof data === 'string' ? data : (data as any).IdToken || data;
        } catch (error) {
            console.error('MIPRES Auth Error:', error);
            throw new Error('No se pudo autenticar con MIPRES');
        }
    },

    /**
     * Sends a prescription to MIPRES functionality.
     */
    createPrescription: async (prescription: GenerarPrescripcionRequest, token: string): Promise<PrescriptionResponse> => {
        // Mock for development
        if (token.startsWith('mock-')) {
            console.log('MIPRES Mock Prescription Sent:', prescription);

            // Circular 044 (2025) Logic:
            // UPC medications are auto-approved but tracked.
            const isUPC = prescription.scope === 'UPC';
            const prefix = isUPC ? 'UPC' : 'NOPBS';

            return {
                NoPrescripcion: `${prefix}-${2026}${Math.floor(Math.random() * 1000000)}`,
                IdTransaccion: crypto.randomUUID(),
                Fecha: new Date().toISOString(),
                Estado: isUPC ? 'Aprobada (Universal)' : 'Activa'
            };
        }

        try {
            const response = await fetch(`${MIPRES_URL}/Prescripcion/${PRESCRIBER_NIT}/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Ocp-Apim-Subscription-Key': SUB_KEY
                },
                body: JSON.stringify({ ...prescription })
                // Note: The API might expect specific wrapping or raw list depending on endpoint version
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`MIPRES Error: ${errText}`);
            }

            const data: PrescriptionResponse = await response.json();
            return data;
        } catch (error: any) {
            console.error('MIPRES Prescribe Error:', error);
            throw new Error(error.message || 'Fallo la generacion de la prescripcion MIPRES');
        }
    }
};
