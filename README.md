# Project Setup: Backend API dengan Bun, ElysiaJS, dan Drizzle

Boilerplate backend ini dibangun dengan:
- **Runtime**: [Bun](https://bun.sh/)
- **Framework**: [ElysiaJS](https://elysiajs.com/)
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
- **Database**: MySQL

## Persiapan
1. Pastikan Anda telah menginstal Bun.
2. Buat database MySQL di server atau lokal Anda.
3. Sesuaikan URL koneksi database di dalam file `.env`:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/websitevibe_db"
   ```

## Menjalankan Migrasi Database
Untuk membuat atau memperbarui skema di database Anda berdasarkan file `src/db/schema.ts`, jalankan perintah berikut:

```bash
# Untuk melakukan generate schema migration files
bun run db:generate

# Untuk mempush schema langsung ke database
bun run db:push
```

## Menjalankan Server
Untuk menjalankan server dalam mode development dengan hot-reload:

```bash
bun run dev
```

Server akan berjalan pada port `3000`. 
Anda dapat mengakses `http://localhost:3000/ping` atau `http://localhost:3000/users` untuk mengujinya.
