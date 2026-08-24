
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cupsData = [
    { code: '890201', description: 'CONSULTA DE PRIMERA VEZ POR MEDICINA GENERAL', category: 'Consulta' },
    { code: '890301', description: 'CONSULTA DE CONTROL O DE SEGUIMIENTO POR MEDICINA GENERAL', category: 'Consulta' },
    { code: '902213', description: 'HEMOGRAMA IV (HEMOGLOBINA, HEMATOCRITO, RECUENTO DE ERITROCITOS, INDICES ERITROCITARIOS, LEUCOGRAMA, RECUENTO DE PLAQUETAS, INDICES PLAQUETARIOS Y MORFOLOGIA ELECTRONICA)', category: 'Laboratorio' },
    { code: '903825', description: 'CREATININA EN SUERO, ORINA U OTROS FLUIDOS', category: 'Laboratorio' },
    { code: '903841', description: 'GLUCOSA EN SUERO U OTRO FLUIDO DIFERENTE A ORINA', category: 'Laboratorio' },
    { code: '871020', description: 'RADIOGRAFIA DE TORAX (PA O AP Y LATERAL)', category: 'Imagenologia' },
    { code: '876801', description: 'RADIOGRAFIA DE COLUMNA CERVICAL O DORSAL (AP Y LATERAL)', category: 'Imagenologia' },
    { code: '881332', description: 'ECOGRAFIA OBSTETRICA TRANSVAGINAL', category: 'Imagenologia' },
    { code: '890203', description: 'CONSULTA DE PRIMERA VEZ POR ODONTOLOGIA GENERAL', category: 'Odontologia' },
    { code: '232101', description: 'OBTURACION DENTAL CON RESINA DE FOTO-CURADO (UNA SUPERFICIE)', category: 'Odontologia' },
    { code: '232102', description: 'OBTURACION DENTAL CON RESINA DE FOTO-CURADO (DOS SUPERFICIES)', category: 'Odontologia' },
];

async function main() {
    console.log('Start seeding CUPS...');
    for (const c of cupsData) {
        const exists = await prisma.cUPS.findUnique({ where: { code: c.code } });
        if (!exists) {
            await prisma.cUPS.create({ data: c });
            console.log(`Created CUPS: ${c.code}`);
        } else {
            console.log(`Skipped (exists): ${c.code}`);
        }
    }
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
