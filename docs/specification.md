# Spesifikasi Sistem — Sistem Informasi Perpustakaan (SIPUS)

## 1. Pendahuluan

### 1.1 Tujuan Dokumen
Dokumen ini adalah turunan teknis dari PRD, merinci spesifikasi fungsional dan non-fungsional setiap modul agar dapat langsung diacu pada tahap implementasi.

### 1.2 Ruang Lingkup
**Termasuk dalam ruang lingkup (versi 1.0):** seluruh modul pada bagian 3.

**Tidak termasuk dalam ruang lingkup versi 1.0** (lihat `docs/roadmap.md` untuk rencana ke depan):
- Reservasi buku online oleh anggota
- Notifikasi otomatis (email/SMS/WhatsApp)
- Dukungan multi-cabang/multi-lokasi
- Integrasi barcode/RFID
- Payment gateway untuk pembayaran denda

## 2. Aktor & Matriks Hak Akses
| Modul | Admin | Petugas | Anggota |
|---|---|---|---|
| Login / Logout / Ganti Password | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | — |
| Kelola Petugas | ✅ | — | — |
| Kelola Anggota | ✅ | ✅ (operasional) | Lihat profil sendiri |
| Kelola Buku | ✅ | ✅ | Lihat katalog |
| Kelola Kategori / Penulis / Penerbit | ✅ | — | — |
| Transaksi Peminjaman | ✅ (pengawasan) | ✅ (operasional) | Lihat riwayat & status |
| Transaksi Pengembalian | ✅ (pengawasan) | ✅ (operasional) | Lihat riwayat & status |
| Laporan | ✅ | — | — |
| Pengaturan Denda | ✅ | — | — |

## 3. Spesifikasi Fungsional per Modul

### 3.1 Modul Login
- Form login: username/email + password
- Validasi: akun berstatus aktif, password sesuai (dicocokkan dalam bentuk hash)
- Logout: invalidasi sesi
- Ganti password: wajib memasukkan ulang password lama sebelum mengganti
- *(Rekomendasi keamanan, perlu konfirmasi stakeholder)* lockout sementara setelah beberapa kali percobaan gagal

### 3.2 Modul Dashboard
- Statistik ringkas: Jumlah Buku, Jumlah Anggota, Jumlah Buku Sedang Dipinjam, Jumlah Buku Terlambat, Total Denda (akumulasi belum dibayar)
- Grafik peminjaman (misalnya tren per bulan)
- Diakses oleh Admin & Petugas

### 3.3 Modul Buku
**Field:** ISBN, Judul, Penulis, Penerbit, Kategori, Tahun Terbit, Stok, Lokasi Rak

**Fitur:** Tambah, Edit, Hapus, Cari (judul/ISBN/penulis), Filter (kategori/penerbit/ketersediaan stok), Import Excel, Export Excel

**Validasi:**
- ISBN unik per buku
- Stok ≥ 0
- Tahun terbit dalam rentang yang valid
- Hapus buku dicegah (atau diarahkan ke soft-delete) bila masih memiliki histori transaksi peminjaman

### 3.4 Modul Kategori / Penulis / Penerbit
CRUD sederhana: Tambah, Edit, Hapus, Cari. Penghapusan dicegah (atau soft-delete) apabila data masih direferensikan oleh tabel Buku, untuk menjaga integritas referensial.

### 3.5 Modul Anggota
**Field:** Nama, Jenis Kelamin, Alamat, No HP, Email, Status (Aktif/Nonaktif)

**Fitur:** Registrasi, Edit, Hapus/Nonaktifkan, Cetak Kartu Anggota (PDF — direkomendasikan menyertakan QR/barcode `id_anggota` untuk mempercepat transaksi di loket)

### 3.6 Modul Petugas
**Field:** Nama, Username, Password, Level (Admin/Petugas), No HP

**Fitur:** CRUD lengkap, hanya dapat diakses oleh Admin. Password di-hash sebelum disimpan dan tidak pernah ditampilkan ulang dalam bentuk asli.

### 3.7 Modul Peminjaman
**Field:** Nomor Peminjaman, Anggota, Petugas, daftar Buku & jumlah (Detail_Peminjaman), Tanggal Pinjam, Tanggal Kembali (target)

**Fitur:** Tambah Peminjaman, Cari Anggota, Cari Buku, Validasi Stok, Cetak Bukti

**Aturan bisnis:**
- Status awal transaksi: `Dipinjam`
- Saat transaksi disimpan, stok setiap buku terkait dikurangi sesuai jumlah yang dipinjam
- *(Perlu konfirmasi kebijakan institusi)* anggota berstatus `Nonaktif` atau memiliki denda belum lunas dapat dibatasi untuk meminjam

### 3.8 Modul Pengembalian
**Field:** Nomor Pengembalian, Nomor Peminjaman, Tanggal Kembali (aktual), Terlambat (hari), Denda

**Fitur:** Hitung Denda Otomatis, Update Stok Buku, Cetak Bukti

**Formula keterlambatan & denda:**
```
terlambat (hari) = MAX(0, tanggal_dikembalikan - tanggal_kembali_target)
denda            = terlambat × tarif_denda_per_hari × jumlah_buku
```
`tarif_denda_per_hari` bersifat **konfigurabel oleh Admin** (sesuai hak akses "Mengatur Denda" pada PRD) dan disimpan sebagai data pengaturan sistem — bukan nilai hardcode di kode aplikasi.

**Efek samping saat pengembalian diproses:**
- Status `Peminjaman` terkait diubah menjadi `Selesai`
- Stok buku terkait ditambahkan kembali sesuai jumlah yang dikembalikan

### 3.9 Modul Laporan
**Jenis:** Laporan Buku, Anggota, Peminjaman, Pengembalian, Denda

**Format output:** PDF & Excel

**Rekomendasi tambahan:** filter rentang tanggal, filter per kategori/anggota/petugas, hanya dapat diakses oleh Admin

## 4. Aturan Bisnis Utama (Ringkasan)
1. Stok buku tidak boleh negatif; permintaan peminjaman ditolak jika stok tidak cukup.
2. Stok berkurang saat peminjaman disimpan dan bertambah kembali saat pengembalian diproses.
3. Denda dihitung otomatis berdasarkan selisih hari keterlambatan dan tarif yang berlaku saat pengembalian diproses.
4. Data master (Kategori/Penulis/Penerbit) tidak dapat dihapus selama masih direferensikan oleh data Buku.
5. Hanya Admin yang dapat mengubah tarif denda dan mengelola akun Petugas.

## 5. Model Data
Tabel mengacu pada ERD awal, ditambah tabel `users` untuk autentikasi terpusat (lihat `docs/architecture.md` bagian 4.2):

| Tabel | Keterangan |
|---|---|
| `users` | Kredensial login & role (tambahan, lihat architecture.md) |
| `petugas` | Profil Admin/Petugas |
| `anggota` | Profil anggota perpustakaan |
| `kategori` | Klasifikasi buku |
| `penerbit` | Data penerbit |
| `penulis` | Data penulis |
| `buku` | Katalog buku & stok |
| `peminjaman` | Header transaksi peminjaman |
| `detail_peminjaman` | Detail buku & jumlah per transaksi peminjaman |
| `pengembalian` | Transaksi pengembalian, keterlambatan, denda |
| `pengaturan_denda` *(rekomendasi)* | Menyimpan tarif denda per hari yang berlaku, dapat diubah Admin |

Struktur DDL detail (SQL MySQL) untuk versi awal sudah tersedia pada dokumen ERD; perlu diadaptasi ke dialek PostgreSQL (mis. `SERIAL`/`IDENTITY` sebagai pengganti `AUTO_INCREMENT`, `ENUM` via custom type atau `CHECK` constraint) saat implementasi skema Prisma.

## 6. Spesifikasi Non-Fungsional
| Aspek | Ketentuan |
|---|---|
| Performance | Waktu respons < 3 detik; mendukung minimal 50 pengguna bersamaan |
| Security | Login authentication, password hashing, session management, Role Based Access Control, audit log |
| Backup | Backup & restore database secara terjadwal |
| Compatibility | Berfungsi baik di Chrome, Firefox, Edge, Safari |

## 7. Asumsi & Batasan
- Tarif denda default belum ditentukan dalam PRD — perlu ditetapkan oleh pihak perpustakaan sebelum go-live; sistem hanya menyediakan mekanisme konfigurasinya.
- Satu anggota dapat meminjam lebih dari satu judul buku dalam satu transaksi peminjaman (ditangani oleh `detail_peminjaman`).
- Pembayaran denda pada versi 1.0 diasumsikan dilakukan secara manual/offline; tidak ada modul payment gateway.
- Notifikasi otomatis (email/SMS) untuk jatuh tempo atau denda belum termasuk dalam ruang lingkup versi 1.0.

## 8. Kriteria Penerimaan MVP
Mengacu pada prioritas PRD bagian 11, MVP dianggap selesai bila:
- [ ] Login & RBAC berfungsi untuk ketiga role (Admin, Petugas, Anggota)
- [ ] Dashboard menampilkan kelima metrik utama
- [ ] CRUD Buku, Anggota, dan Petugas berfungsi penuh dengan validasi
- [ ] Transaksi Peminjaman memvalidasi stok dan mengurangi stok dengan benar
- [ ] Transaksi Pengembalian menghitung denda otomatis dan mengembalikan stok dengan benar
- [ ] Laporan dapat diekspor dalam format PDF dan Excel untuk kelima jenis laporan
