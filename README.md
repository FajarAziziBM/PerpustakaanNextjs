# Sistem Informasi Perpustakaan (SIPUS)

Sistem informasi perpustakaan berbasis web untuk mengelola data buku, anggota, petugas, transaksi peminjaman, pengembalian, denda, dan pelaporan secara terkomputerisasi.

Dokumen ini adalah tahap awal (scaffolding) proyek. Detail teknis lebih lanjut ada di folder [`docs/`](docs/).

## Daftar Isi
- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Struktur Proyek](#struktur-proyek-rencana)
- [Menjalankan Proyek](#menjalankan-proyek)
- [Role Pengguna](#role-pengguna)
- [Dokumentasi Lengkap](#dokumentasi-lengkap)
- [Status Pengembangan](#status-pengembangan)

## Fitur Utama
Berdasarkan PRD, sistem ini mencakup:
- Autentikasi & manajemen hak akses (Admin, Petugas, Anggota)
- Dashboard statistik (jumlah buku, anggota, peminjaman aktif, keterlambatan, total denda)
- Master data: Buku, Kategori, Penulis, Penerbit, Anggota, Petugas
- Transaksi peminjaman & pengembalian buku dengan validasi stok
- Perhitungan denda otomatis untuk keterlambatan
- Import/export data buku (Excel)
- Pelaporan (PDF/Excel): laporan buku, anggota, peminjaman, pengembalian, denda
- Cetak kartu anggota & bukti transaksi

## Tech Stack
| Layer | Teknologi |
|---|---|
| Frontend & Backend | Next.js 16 (App Router, Turbopack) + TypeScript + React 19 |
| Database | PostgreSQL |
| ORM | Prisma ORM 7 (driver adapter `@prisma/adapter-pg`) |
| Autentikasi | Custom (JWT via `jose` di cookie httpOnly + `bcryptjs`) — lihat alasan di `docs/architecture.md` §5 |
| Styling/UI | Tailwind CSS v4 (CSS-first config) |
| Container Runtime | Podman & Podman Compose |
| Export Laporan | exceljs (Excel), @react-pdf/renderer (PDF) |

> Skeleton ini sudah diverifikasi: `npx tsc --noEmit` dan `npm run build` (Next.js 16.2.9 + Turbopack) berjalan tanpa error di lingkungan pengembangan.

## Struktur Proyek
```
.
├── README.md
├── podman-compose.yml
├── Dockerfile
├── .dockerignore
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── prisma.config.ts
├── docs/
│   ├── architecture.md
│   ├── specification.md
│   └── roadmap.md
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
└── src/
    ├── proxy.ts            # RBAC route protection (pengganti middleware.ts di Next.js 16)
    ├── app/
    │   ├── layout.tsx, page.tsx, globals.css
    │   ├── login/          # halaman & server action login
    │   ├── dashboard/      # area Admin/Petugas (terlindungi)
    │   ├── portal/         # area Anggota (terlindungi)
    │   └── unauthorized/
    ├── lib/
    │   ├── auth.ts         # sesi JWT, hash password
    │   ├── db.ts           # Prisma Client singleton
    │   ├── rbac.ts         # mapping role -> route
    │   ├── denda.ts        # aturan bisnis keterlambatan & denda
    │   └── actions/logout.ts
    └── generated/prisma/   # dibuat otomatis oleh `prisma generate`, jangan diedit manual
```

## Menjalankan Proyek

### Prasyarat
- Podman ≥ 4.x
- `podman-compose` atau plugin `podman compose`
- Node.js ≥ 18 (opsional, untuk development lokal di luar container)

### Konfigurasi Environment
Buat file `.env` di root proyek. Semua variabel berikut sudah punya default di `podman-compose.yml`, tapi **wajib diganti** untuk lingkungan produksi:

| Variabel | Default | Keterangan |
|---|---|---|
| `POSTGRES_DB` | `sipus_db` | Nama database |
| `POSTGRES_USER` | `sipus_user` | User database |
| `POSTGRES_PASSWORD` | `sipus_pass` | Password database (wajib diganti) |
| `DB_PORT` | `5432` | Port PostgreSQL di host |
| `DATABASE_URL` | *(lihat `.env.example`)* | Connection string Prisma; host `db` saat lewat compose, `localhost` saat dev lokal |
| `APP_PORT` | `3000` | Port aplikasi Next.js di host |
| `AUTH_SECRET` | `change_this_secret` | Secret untuk menandatangani JWT sesi login (wajib diganti, lihat `src/lib/auth.ts`) |
| `PGADMIN_EMAIL` | `admin@sipus.local` | Login email pgAdmin (tool opsional) |
| `PGADMIN_PASSWORD` | `admin` | Login password pgAdmin |

### Menjalankan dengan Podman Compose
```bash
# 1. Jalankan database (+ pgAdmin opsional)
podman-compose up -d db

# 2. Install dependency & siapkan database (cukup sekali / saat skema berubah)
npm install
npx prisma migrate dev --name init
npm run db:seed

# 3. Build & jalankan aplikasi (di dalam container)
podman-compose up -d --build app

# (Opsional) jalankan juga pgAdmin untuk inspeksi database
podman-compose --profile tools up -d

# Melihat log aplikasi
podman-compose logs -f app

# Menghentikan semua service
podman-compose down
```
Aplikasi akan tersedia di `http://localhost:3000` dan pgAdmin (jika diaktifkan) di `http://localhost:5050`.

> **Kenapa migrate/seed dijalankan dari host, bukan dari dalam container `app`?**
> Image produksi `app` sengaja dibuat ramping (output `standalone`, tanpa Prisma CLI/devDependencies). Untuk migrasi skema, jalankan `npx prisma migrate dev`/`db:seed` dari host — `DATABASE_URL` di `.env` cukup diarahkan ke `localhost:${DB_PORT}` karena port database sudah di-expose oleh `podman-compose.yml`.

### Pengembangan Lokal (tanpa container app)
Untuk iterasi cepat saat development, jalankan database lewat Podman tapi aplikasi Next.js langsung di host:
```bash
podman-compose up -d db
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```
Akun awal hasil seed: `admin` / `admin123` — **wajib diganti** setelah login pertama.

## Role Pengguna
| Role | Ringkasan Akses |
|---|---|
| Admin | Akses penuh: kelola petugas, anggota, buku, master data, transaksi, laporan, dan pengaturan denda |
| Petugas | Kelola buku & anggota, proses peminjaman/pengembalian, cetak bukti |
| Anggota | Lihat profil, katalog buku, riwayat & status peminjaman |

## Dokumentasi Lengkap
- [`docs/architecture.md`](docs/architecture.md) — Arsitektur sistem, struktur folder, desain database & keamanan
- [`docs/specification.md`](docs/specification.md) — Spesifikasi fungsional & non-fungsional lengkap per modul
- [`docs/roadmap.md`](docs/roadmap.md) — Rencana pengembangan bertahap (MVP → lanjutan)

## Status Pengembangan
✅ **Fase 1 (MVP) hampir tuntas** — seluruh modul inti PRD bagian 11 sudah berfungsi end-to-end: login/RBAC, master data, transaksi peminjaman & pengembalian, denda otomatis, dan laporan PDF/Excel. Sisa: filter lanjutan katalog Buku, cetak kartu Anggota, dan cetak bukti transaksi — lihat `docs/roadmap.md` Fase 1 untuk detail.

## Yang Sudah Berfungsi
- Login & logout (Server Action + sesi JWT di cookie httpOnly)
- RBAC dua lapis: pemeriksaan cepat di `src/proxy.ts` (pengganti `middleware.ts` di Next.js 16) + pemeriksaan otoritatif di setiap layout — lihat alasan keamanannya di `docs/architecture.md` §5
- Dashboard Admin/Petugas dengan 5 statistik dasar (query langsung ke database)
- Portal Anggota: profil & riwayat peminjaman terakhir
- **Master data CRUD lengkap:** Buku (+ cari judul/ISBN), Kategori, Penulis, Penerbit, Anggota (+ cari nama/email), Petugas (khusus Admin, otomatis membuat akun login)
- **Transaksi Peminjaman:** multi-buku per transaksi, validasi & potong stok di dalam satu DB transaction, batalkan transaksi (stok dikembalikan)
- **Transaksi Pengembalian:** hitung keterlambatan & denda otomatis (dengan preview real-time), stok dikembalikan
- **Pengaturan Denda:** Admin dapat mengubah tarif Rp/hari/buku kapan saja tanpa redeploy
- **Laporan PDF & Excel:** Buku, Anggota, Peminjaman, Pengembalian, Denda — bisa difilter rentang tanggal untuk laporan transaksi (`/dashboard/laporan`)
- Skema Prisma lengkap (11 tabel sesuai ERD + `users` & `pengaturan_denda`), migrasi awal sudah pernah dijalankan
- Seed akun admin (`npm run db:seed`) & seed data dummy skala besar untuk testing (`npm run db:seed:faker`)

Belum diimplementasikan (lihat `docs/roadmap.md` Fase 1 sisa & Fase 2): filter multi-kriteria katalog Buku, cetak kartu Anggota, cetak bukti transaksi, import/export Excel data Buku, audit log, backup terjadwal, dan grafik di dashboard.

## Lisensi
Belum ditentukan — sesuaikan dengan kebutuhan institusi/organisasi pemilik proyek.
