// server.js
// Struktur Backend KUMAGEMA (Express.js, Prisma, PostgreSQL)
// CATATAN PENTING: Pastikan Anda telah menjalankan 'npm install express @prisma/client cors' dan 'npm run migrate:dev'

const express = require('express');
const { PrismaClient } = require('@prisma/client'); // Menggunakan Prisma Client yang sesungguhnya
const cors = require('cors'); // Diperlukan untuk komunikasi frontend

// Inisialisasi Prisma Client. Ini akan membaca DATABASE_URL dari file .env
const prisma = new PrismaClient(); 
const app = express();
// Menggunakan port 3000 untuk backend. Frontend React biasanya berjalan di 5173 atau 3000.
const PORT = process.env.PORT || 3000; 

// Middleware
// Mengizinkan semua origin untuk pengembangan. Di produksi, ganti '*' dengan URL frontend Anda.
app.use(cors()); 
app.use(express.json()); // Untuk memproses body JSON dari request

// Middleware Sederhana untuk mencatat request
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- ROUTES ---

// 1. Route Beranda
app.get('/', (req, res) => {
    res.send({ 
        status: 'OK', 
        service: 'KUMAGEMA API v1 - Server Berjalan',
        database: 'PostgreSQL via Prisma'
    });
});

// 2. Route Game Catalog
// Endpoint: http://localhost:3000/api/games
// Digunakan oleh React frontend untuk mengambil daftar game
app.get('/api/games', async (req, res) => {
    try {
        // Mengambil data dari tabel 'Game' di PostgreSQL.
        const games = await prisma.game.findMany({
            orderBy: {
                title: 'asc', // Urutkan berdasarkan judul
            },
            select: {
                id: true,
                title: true,
                genre: true,
                price: true,
                description: true,
                imageUrl: true,
            }
        });
        
        res.status(200).json(games);
    } catch (error) {
        console.error("Gagal mengambil data game:", error);
        res.status(500).json({ error: "Terjadi kesalahan pada server saat mengambil data game." });
    }
});

// 3. Route Pembelian (Struktur E-commerce Sederhana)
// Endpoint: http://localhost:3000/api/purchase
app.post('/api/purchase', (req, res) => {
    const { gameId, userId } = req.body;

    if (!gameId || !userId) {
        return res.status(400).json({ error: "Game ID dan User ID wajib diisi." });
    }

    // Ini adalah respons dummy. Logika transaksi nyata menggunakan Prisma akan ditambahkan di sini.

    res.status(201).json({ 
        message: `Pembelian Game ID: ${gameId} berhasil diproses. Ini adalah respons dummy transaksi.`,
        success: true
    });
});

// --- SERVER STARTUP ---

async function main() {
    // Memastikan koneksi database berjalan (memverifikasi kredensial)
    await prisma.$connect(); 
    
    app.listen(PORT, () => {
        console.log(`Server Express.js KUMAGEMA berjalan di http://localhost:${PORT}`);
        console.log(`API Games: http://localhost:${PORT}/api/games`);
    });
}

// Menjalankan server dan menangani error disconnect
main()
  .catch(async (e) => {
    console.error("Kesalahan Fatal Server:", e);
    // Memutuskan koneksi database sebelum keluar
    await prisma.$disconnect(); 
    process.exit(1);
  });
