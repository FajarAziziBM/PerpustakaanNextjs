# Roadmap Pengembangan — Sistem Informasi Perpustakaan (SIPUS)

> Catatan: estimasi dan urutan bersifat indikatif, perlu disesuaikan dengan kapasitas tim aktual.

## Fase 0 — Inisialisasi & Infrastruktur
- [x] Penyusunan PRD & ERD
- [x] Dokumentasi awal: `README.md`, `architecture.md`, `specification.md`, `roadmap.md`
- [x] Setup repository & `podman-compose.yml` (database + skeleton aplikasi)
- [x] Setup project Next.js + schema Prisma awal
- [x] Setup pemeriksaan dasar (lint, type-check otomatis di CI) — ESLint (`eslint-config-next`, flat config) + `npm run typecheck` dijalankan otomatis lewat GitHub Actions (`.github/workflows/ci.yml`) pada setiap push/PR ke `main`

## Fase 1 — MVP (hampir selesai)
Mengacu pada prioritas PRD bagian 11:
1. [x] Login & Hak Akses (Admin, Petugas, Anggota + RBAC) — **Ganti Password (self-service) belum ada**
2. [x] Dashboard (statistik dasar)
3. [x] Master Buku — CRUD ✅, cari (judul/ISBN) ✅, **filter kategori/penerbit/stok belum ada**
4. [x] Master Anggota — CRUD + cari ✅, **cetak kartu anggota belum ada**
5. [x] Master Petugas (CRUD, khusus Admin)
6. [x] Master Kategori / Penulis / Penerbit
7. [x] Transaksi Peminjaman (multi-buku per transaksi, validasi stok di dalam DB transaction)
8. [x] Transaksi Pengembalian
9. [x] Perhitungan Denda Otomatis (+ halaman Pengaturan Denda untuk Admin)
10. [x] Laporan PDF/Excel: Buku, Anggota, Peminjaman, Pengembalian, Denda

**Sisa pekerjaan sebelum Fase 1 benar-benar tuntas:** Ganti Password (self-service, ketiga role — disebut eksplisit di PRD sebagai bagian Modul Login, sebelumnya ikut tercentang tanpa sengaja di item Login & Hak Akses), cetak kartu Anggota, dan cetak bukti transaksi Peminjaman/Pengembalian (filter lanjutan katalog Buku sudah selesai duluan, lihat Fase 2).

**Target keluaran Fase 1:** sistem dapat dipakai untuk operasional harian perpustakaan secara end-to-end (peminjaman → pengembalian → denda → laporan). **Sudah tercapai secara fungsional.**

## Fase 2 — Penyempurnaan & Fitur Pendukung
- [ ] Import/Export Excel untuk data Buku
- [ ] Audit log (siapa melakukan apa, kapan)
- [ ] Backup & restore database terjadwal
- [x] Grafik peminjaman pada dashboard — bar chart 12 bulan, donut status peminjaman, top kategori buku (SVG murni, Server Component, zero dependency baru)
- [x] ~~Pengaturan tarif denda melalui UI~~ — sudah dikerjakan lebih awal di Fase 1 (`/dashboard/pengaturan-denda`), karena jadi prasyarat modul Pengembalian
- [x] Pencarian & filter lanjutan (multi-kriteria) pada katalog buku — cari judul/ISBN + filter Kategori/Penerbit/Ketersediaan Stok
- [ ] Cetak kartu Anggota & cetak bukti transaksi Peminjaman/Pengembalian (PDF) — kartu Anggota disertai QR/barcode berisi `id_anggota` untuk mempercepat pencarian saat transaksi di loket (sekadar elemen visual di kartu; sistem *scanning* otomatis untuk transaksi tetap di Fase 3, lihat item "Integrasi barcode/QR")
- [ ] Portal Anggota: Lihat Katalog Buku (read-only, cari judul/ISBN — melengkapi matriks akses "Kelola Buku → Anggota: Lihat katalog")
- [ ] Portal Anggota: tampilkan detail Pengembalian di riwayat (tanggal dikembalikan, jumlah hari terlambat, nominal denda — saat ini portal cuma menampilkan status Peminjaman, belum data dari tabel Pengembalian)
- [x] **Pagination di semua tabel** (item tambahan di luar rencana awal, jadi prioritas setelah data seed faker mencapai 1000+ baris Buku/Anggota) — `src/lib/pagination.ts` + `src/components/pagination.tsx`, dipakai di 8 modul (Kategori, Penulis, Penerbit, Buku, Anggota, Petugas, Peminjaman, Pengembalian)

## Fase 3 — Pengembangan Lanjutan (Pasca Versi 1.0)
- Notifikasi otomatis (email/WhatsApp) untuk jatuh tempo & denda
- Reservasi buku online oleh Anggota
- Perpanjangan peminjaman mandiri oleh Anggota (dengan aturan/limit tertentu)
- Integrasi barcode/QR pada Buku & Kartu Anggota untuk mempercepat transaksi
- Dukungan multi-cabang/multi-lokasi perpustakaan
- Aplikasi mobile (companion app) untuk Anggota

## Dependensi & Risiko
| Risiko | Mitigasi |
|---|---|
| Tarif denda belum ditentukan oleh stakeholder | Sediakan nilai default + mekanisme konfigurasi mudah oleh Admin |
| Migrasi data lama (jika sebelumnya dikelola manual) | Sediakan fitur Import Excel sejak Fase 1 untuk data Buku |
| Beban bersamaan saat jam ramai (≥ 50 pengguna) | Load testing sebelum go-live, optimasi index database |
| Definisi kebijakan peminjaman (limit anggota, dsb.) belum jelas | Konfirmasi ke stakeholder sebelum implementasi Modul Peminjaman |

## Ringkasan Milestone
| Fase | Fokus | Status |
|---|---|---|
| 0 | Infrastruktur & Dokumentasi | 🟢 Selesai (5/5) |
| 1 | MVP Operasional | 🟢 Selesai secara fungsional (tersisa: ganti password, cetak kartu/bukti) |
| 2 | Penyempurnaan | 🚧 Berjalan (4/10) |
| 3 | Pengembangan Lanjutan | ⏳ Belum dimulai |

## Referensi
- [`docs/specification.md`](specification.md) — detail kebutuhan fungsional/non-fungsional per modul
- [`docs/architecture.md`](architecture.md) — detail teknis arsitektur & struktur folder
