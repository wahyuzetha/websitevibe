import { db } from './src/db/index.ts';
import { materials } from './src/db/schema.ts';
import fs from 'fs';
import path from 'path';

async function seed() {
    // Ensure directories exist
    const dir = 'public/uploads/materials';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const dummyMaterials = [
        {
            title: "Modul Dasar Jaringan Komputer",
            description: "Materi ini membahas konsep dasar jaringan komputer, topologi, protokol OSI, dan cara kerja TCP/IP secara fundamental. Sangat cocok untuk pemula.",
            imageUrl: "",
            fileUrl: "/uploads/materials/modul_jaringan.pdf"
        },
        {
            title: "Panduan Praktikum Fiber Optic",
            description: "Langkah-langkah praktikum penyambungan kabel fiber optic menggunakan splicer, lengkap dengan standar keselamatan dan troubleshooting.",
            imageUrl: "",
            fileUrl: "/uploads/materials/praktikum_fiber.pdf"
        },
        {
            title: "Instalasi Server Debian 11",
            description: "Modul lengkap instalasi dan konfigurasi dasar server Linux Debian 11, termasuk DNS, DHCP, Web Server, dan FTP Server untuk kebutuhan lab.",
            imageUrl: "",
            fileUrl: "/uploads/materials/server_debian.pdf"
        }
    ];

    for (const m of dummyMaterials) {
        // Create a dummy PDF file
        const filePath = path.join(process.cwd(), 'public', m.fileUrl);
        fs.writeFileSync(filePath, "Ini adalah isi file dummy PDF untuk " + m.title);

        await db.insert(materials).values(m);
        console.log("Inserted:", m.title);
    }
    console.log("Seeding materials completed!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
