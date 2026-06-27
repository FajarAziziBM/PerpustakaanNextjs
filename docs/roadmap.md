# Roadmap Pengembangan — Sistem Informasi Perpustakaan (SIPUS)

> Catatan: estimasi dan urutan bersifat indikatif, perlu disesuaikan dengan kapasitas tim aktual.

## Fase 0 — Inisialisasi & Infrastruktur (Saat ini)
- [x] Penyusunan PRD & ERD
- [x] Dokumentasi awal: `README.md`, `architecture.md`, `specification.md`, `roadmap.md`
- [ ] Setup repository & `podman-compose.yml` (database + skeleton aplikasi)
- [ ] Setup project Next.js + schema Prisma awal
- [ ] Setup pemeriksaan dasar (lint, type-check)

## Fase 1 — MVP
Mengacu pada prioritas PRD bagian 11:
1. Login & Hak Akses (Admin, Petugas, Anggota + RBAC)
2. Dashboard (statistik dasar)
3. Master Buku (CRUD, cari, filter)
4. Master Anggota (CRUD, cetak kartu)
5. Master Petugas (CRUD, khusus Admin)
6. Master Kategori / Penulis / Penerbit
7. Transaksi Peminjaman (dengan validasi stok)
8. Transaksi Pengembalian
9. Perhitungan Denda Otomatis
10. Laporan dasar (PDF/Excel): Buku, Anggota, Peminjaman, Pengembalian, Denda

**Target keluaran Fase 1:** sistem dapat dipakai untuk operasional harian perpustakaan secara end-to-end (peminjaman → pengembalian → denda → laporan).

## Fase 2 — Penyempurnaan & Fitur Pendukung
- Import/Export Excel untuk data Buku
- Audit log (siapa melakukan apa, kapan)
- Backup & restore database terjadwal
- Grafik peminjaman pada dashboard
- Pengaturan tarif denda melalui UI (bukan nilai hardcode)
- Pencarian & filter lanjutan (multi-kriteria) pada katalog buku

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
| 0 | Infrastruktur & Dokumentasi | 🚧 Berjalan |
| 1 | MVP Operasional | ⏳ Belum dimulai |
| 2 | Penyempurnaan | ⏳ Belum dimulai |
| 3 | Pengembangan Lanjutan | ⏳ Belum dimulai |

## Referensi
- [`docs/specification.md`](specification.md) — detail kebutuhan fungsional/non-fungsional per modul
- [`docs/architecture.md`](architecture.md) — detail teknis arsitektur & struktur folder
