# Arsitektur Sistem — Sistem Informasi Perpustakaan (SIPUS)

## 1. Gambaran Umum
SIPUS dibangun sebagai aplikasi web modern menggunakan Next.js, yang menangani baik tampilan (UI) maupun logika backend (Route Handlers / Server Actions) dalam satu basis kode, dengan PostgreSQL sebagai database relasional.

```
┌───────────────────────────────────────────────────────────┐
│                         Browser                            │
│      (Admin / Petugas / Anggota — Chrome, Firefox,         │
│             Edge, Safari)                                  │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
┌───────────────────────────▼─────────────────────────────────┐
│                   Next.js Application                       │
│  ┌──────────────────┐    ┌──────────────────────────────┐   │
│  │   UI Layer        │    │   API Layer                  │   │
│  │  (App Router,      │    │  (Route Handlers /           │   │
│  │   React Server      │    │   Server Actions)             │   │
│  │   Components)        │    │                                │   │
│  └─────────┬─────────┘    └───────────────┬──────────────┘   │
│            └──────────────┬───────────────┘                  │
│                           ▼                                   │
│              RBAC Middleware / Auth.js                        │
│                           │                                    │
│                           ▼                                    │
│             Service / Business Logic Layer                     │
│        (validasi stok, hitung denda, audit log, dst.)            │
│                           │                                      │
│                           ▼                                       │
│                  Prisma ORM (Data Access)                          │
└───────────────────────────┬────────────────────────────────────────┘
                            │ SQL
┌───────────────────────────▼────────────────────────────────────────┐
│                      PostgreSQL Database                            │
└──────────────────────────────────────────────────────────────────────┘
```

Seluruh komponen dijalankan sebagai container terpisah melalui **Podman Compose** (lihat bagian 6).

## 2. Tech Stack & Alasan Pemilihan
| Komponen | Pilihan | Alasan |
|---|---|---|
| Framework | Next.js (App Router, TypeScript) | Satu basis kode untuk UI & API, sesuai PRD ("Framework: nextjs") |
| Database | PostgreSQL | Sesuai PRD, relational, mendukung constraint FK & transaksi ACID untuk transaksi peminjaman/denda |
| ORM | Prisma | Type-safe query, migrasi schema terstruktur |
| Autentikasi | Auth.js (NextAuth) | Mendukung credential login + RBAC, session management |
| Styling | Tailwind CSS + shadcn/ui | Membangun UI konsisten dengan cepat |
| Export Laporan | exceljs, pdf-lib/react-pdf | Memenuhi kebutuhan output Excel & PDF |
| Container Runtime | Podman & Podman Compose | Daemonless, rootless, kompatibel dengan format Compose |

## 3. Struktur Folder (rencana implementasi)
```
.
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (admin)/dashboard/ petugas/ anggota/ buku/ kategori/ penulis/ penerbit/ laporan/
│   │   ├── (petugas)/peminjaman/ pengembalian/
│   │   ├── (anggota)/profil/ riwayat/
│   │   └── api/...
│   ├── components/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── denda.ts
│   │   └── validators/
│   └── middleware.ts
├── public/
├── docs/
├── podman-compose.yml
└── Dockerfile
```

## 4. Model Data & Relasi

### 4.1 Entitas Utama
| Entitas | Fungsi |
|---|---|
| Anggota | Data pengguna perpustakaan yang dapat meminjam buku |
| Petugas | Operator sistem (Admin/Petugas) yang memproses transaksi |
| Kategori | Klasifikasi buku |
| Penerbit | Data penerbit buku |
| Penulis | Data penulis buku |
| Buku | Katalog buku beserta stok dan lokasi rak |
| Peminjaman | Header transaksi peminjaman |
| Detail_Peminjaman | Baris detail buku & jumlah dalam satu transaksi peminjaman |
| Pengembalian | Transaksi pengembalian, keterlambatan, dan denda |

### 4.2 Catatan Penyesuaian Autentikasi
PRD bagian 7 menyebutkan tabel `users` terpisah dari `petugas`/`anggota`, sedangkan ERD awal menyimpan `username`/`password` langsung pada tabel `petugas`. Karena PRD bagian 4 juga memberi hak akses **Login** kepada Anggota, arsitektur ini merekomendasikan tabel kredensial terpusat:

```
users
 ├── id_user (PK)
 ├── username / email
 ├── password_hash
 ├── role            -- enum: admin | petugas | anggota
 ├── ref_id          -- FK ke id_petugas atau id_anggota, sesuai role
 ├── last_login
 └── created_at
```

Tabel `petugas` dan `anggota` tetap menyimpan data profil masing-masing (sesuai ERD awal), sementara `users` khusus menangani kredensial & role. Pendekatan ini memudahkan penerapan RBAC dan audit log terpusat tanpa mengubah struktur data profil yang sudah didefinisikan.

### 4.3 Diagram Relasi (ringkas)
```
Kategori ──┐
           ├──► Buku ◄── Penulis
Penerbit ──┘      │
                   ▼
            Detail_Peminjaman
                   │
                   ▼
Anggota ──► Peminjaman ◄── Petugas
                   │
                   ▼
             Pengembalian

users ──► (role: admin/petugas → ref ke petugas, role: anggota → ref ke anggota)
```

## 5. Keamanan
- Password di-hash dengan bcrypt/argon2 — tidak pernah disimpan dalam bentuk plain text
- Autentikasi sesi via Auth.js (JWT atau database session)
- RBAC: middleware memvalidasi role pada setiap route halaman maupun endpoint API
- Audit log: mencatat aksi penting (login, CRUD master data, transaksi peminjaman/pengembalian)
- Validasi input di setiap form, baik di sisi client maupun server
- HTTPS di lingkungan produksi (terminasi TLS dilakukan di reverse proxy, di luar lingkup container aplikasi)

## 6. Arsitektur Deployment (Podman)
```
┌──────────────────────────────────────────────────────┐
│                 podman-compose.yml                    │
│                                                        │
│   ┌────────────┐      ┌──────────────┐   ┌──────────┐ │
│   │   app      │─────▶│     db        │   │ pgadmin   │ │
│   │ (Next.js)  │      │ (PostgreSQL)  │   │(opsional) │ │
│   └─────┬──────┘      └──────┬───────┘   └────┬─────┘ │
│         │ :3000              │ :5432           │ :80    │
└─────────┼─────────────────────┼─────────────────┼────────┘
          ▼                     ▼                 ▼
    localhost:3000        localhost:5432     localhost:5050
```
- Volume persisten `sipus_db_data` menyimpan data PostgreSQL agar tidak hilang saat container direstart
- Healthcheck pada service `db` memastikan `app` baru start setelah database benar-benar siap
- Network internal `sipus-network` mengisolasi komunikasi antar service dari luar
- Service `pgadmin` berada di profile `tools` sehingga tidak ikut start otomatis pada `up -d` standar

## 7. Pertimbangan Non-Fungsional pada Arsitektur
- **Performance**: target respons < 3 detik, didukung index database pada kolom FK serta kolom pencarian (judul, isbn, nama)
- **Scalability**: mendukung minimal 50 pengguna bersamaan; PgBouncer/connection pooling dapat ditambahkan jika diperlukan di kemudian hari
- **Compatibility**: UI responsif, diuji pada Chrome, Firefox, Edge, Safari
- **Backup**: dump terjadwal (`pg_dump`) dari container `db`, disimpan di luar volume container agar aman dari kegagalan container
