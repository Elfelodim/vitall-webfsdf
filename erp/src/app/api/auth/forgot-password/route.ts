import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, newPassword } = await req.json();

        if (!email) {
            return NextResponse.json(
                { message: 'El correo electrónico es obligatorio' },
                { status: 400 }
            );
        }

        const cleanEmail = email.trim().toLowerCase();

        // If newPassword is provided, reset it directly
        if (newPassword) {
            if (newPassword.length < 6) {
                return NextResponse.json(
                    { message: 'La contraseña debe tener al menos 6 caracteres' },
                    { status: 400 }
                );
            }

            const hashedPassword = await hash(newPassword, 10);

            const user = await prisma.user.upsert({
                where: { email: cleanEmail },
                update: {
                    password: hashedPassword,
                },
                create: {
                    name: cleanEmail.split('@')[0],
                    email: cleanEmail,
                    password: hashedPassword,
                    role: 'Admin',
                }
            });

            return NextResponse.json(
                { message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión.' },
                { status: 200 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'No se encontró una cuenta con ese correo electrónico' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Cuenta verificada correctamente. Ingrese su nueva contraseña.', verified: true },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in forgot-password API:', error);
        return NextResponse.json(
            { message: 'Error interno del servidor: ' + error.message },
            { status: 500 }
        );
    }
}
