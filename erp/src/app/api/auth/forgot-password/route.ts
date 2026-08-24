import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { message: 'El correo electrónico es obligatorio' },
                { status: 400 }
            );
        }

        // Check if user exists (Optional for security to avoid email enumeration, 
        // but here we might want to check for simulation)
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // In a real app, we would:
        // 1. Generate a token
        // 2. Save it in DB with expiry
        // 3. Send email via SMTP/SES

        // For now, we simulate success even if email doesn't exist (security best practice)
        // or specifically for this simulation, we'll assume it's working.

        console.log(`Password reset requested for: ${email}`);

        return NextResponse.json(
            { message: 'Solicitud procesada correctamente' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in forgot-password API:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
