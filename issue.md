# Project Setup: Backend API dengan Bun & ElysiaJS

## Tujuan
Membuat kerangka awal (boilerplate) project backend API menggunakan runtime Bun dengan framework ElysiaJS, serta menyiapkan Drizzle ORM untuk interaksi dengan database MySQL.

## Kebutuhan Utama (Tech Stack)
- **Runtime & Package Manager**: Bun
- **Web Framework**: ElysiaJS
- **ORM**: Drizzle ORM
- **Database**: MySQL (dengan driver yang kompatibel seperti `mysql2`)

## Instruksi Implementasi (High-Level)

### 1. Inisialisasi Project
- Lakukan inisialisasi project baru menggunakan Bun di direktori ini.
- Instal dan integrasikan ElysiaJS ke dalam project sebagai core framework web.
- Pastikan project dapat dijalankan dalam mode development dengan fitur hot-reload yang disediakan oleh Bun.

### 2. Konfigurasi Dependensi Database
- Instal Drizzle ORM sebagai dependensi utama.
- Instal Drizzle Kit sebagai dev-dependency untuk mengelola migrasi schema database.
- Instal driver MySQL (misalnya `mysql2`) agar aplikasi dapat terhubung ke database MySQL.

### 3. Setup Konfigurasi & Skema Database (Drizzle)
- Siapkan environment variables (file `.env`) untuk menyimpan kredensial dan URL koneksi database MySQL.
- Buat file konfigurasi koneksi Drizzle (misal di folder `src/db/index.ts`).
- Definisikan minimal satu skema tabel awal (contoh: tabel `users`) menggunakan Drizzle schema.
- Siapkan file konfigurasi `drizzle.config.ts` untuk Drizzle Kit.

### 4. Integrasi Routing dan Database
- Buat endpoint dasar (contoh: `GET /` atau `GET /ping`) pada ElysiaJS untuk memverifikasi bahwa server menyala dengan baik.
- Buat endpoint tambahan yang melakukan operasi baca/tulis sederhana ke database MySQL menggunakan Drizzle ORM, untuk memastikan koneksi ke database berjalan sukses.

### 5. Finalisasi & Skrip Pendukung
- Tambahkan command/script di dalam `package.json` untuk mempermudah eksekusi:
  - Skrip untuk menjalankan mode development.
  - Skrip untuk generate dan push migrasi Drizzle.
- (Opsional) Update `README.md` dengan instruksi singkat cara menjalankan project dan migrasi database.
