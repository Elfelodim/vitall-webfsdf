import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ message: 'No se recibió ningún archivo' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const timestamp = Date.now();
        const originalName = file.name;
        const safeName = originalName.replace(/[^a-zA-Z0-0.]/g, '_');
        const filename = `${timestamp}-${safeName}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        const filePath = path.join(uploadDir, filename);

        // Ensure directory exists (even if already checked, safe to call)
        await mkdir(uploadDir, { recursive: true });

        await writeFile(filePath, buffer);

        return NextResponse.json({
            url: `/uploads/${filename}`,
            name: file.name
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({
            message: 'Error al subir el archivo',
            details: error.message
        }, { status: 500 });
    }
}
