-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Petugas', 'Anggota');

-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusAnggota" AS ENUM ('Aktif', 'Nonaktif');

-- CreateEnum
CREATE TYPE "StatusPeminjaman" AS ENUM ('Dipinjam', 'Selesai');

-- CreateTable
CREATE TABLE "users" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "id_petugas" INTEGER,
    "id_anggota" INTEGER,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "petugas" (
    "id_petugas" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "no_hp" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "petugas_pkey" PRIMARY KEY ("id_petugas")
);

-- CreateTable
CREATE TABLE "anggota" (
    "id_anggota" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis_kelamin" "JenisKelamin",
    "alamat" TEXT,
    "no_hp" TEXT,
    "email" TEXT,
    "tanggal_daftar" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "StatusAnggota" NOT NULL DEFAULT 'Aktif',

    CONSTRAINT "anggota_pkey" PRIMARY KEY ("id_anggota")
);

-- CreateTable
CREATE TABLE "kategori" (
    "id_kategori" SERIAL NOT NULL,
    "nama_kategori" TEXT NOT NULL,

    CONSTRAINT "kategori_pkey" PRIMARY KEY ("id_kategori")
);

-- CreateTable
CREATE TABLE "penerbit" (
    "id_penerbit" SERIAL NOT NULL,
    "nama_penerbit" TEXT NOT NULL,
    "alamat" TEXT,
    "telepon" TEXT,

    CONSTRAINT "penerbit_pkey" PRIMARY KEY ("id_penerbit")
);

-- CreateTable
CREATE TABLE "penulis" (
    "id_penulis" SERIAL NOT NULL,
    "nama_penulis" TEXT NOT NULL,

    CONSTRAINT "penulis_pkey" PRIMARY KEY ("id_penulis")
);

-- CreateTable
CREATE TABLE "buku" (
    "id_buku" SERIAL NOT NULL,
    "isbn" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tahun_terbit" INTEGER,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "lokasi_rak" TEXT,
    "id_kategori" INTEGER,
    "id_penerbit" INTEGER,
    "id_penulis" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buku_pkey" PRIMARY KEY ("id_buku")
);

-- CreateTable
CREATE TABLE "peminjaman" (
    "id_peminjaman" SERIAL NOT NULL,
    "tanggal_pinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tanggal_kembali" TIMESTAMP(3) NOT NULL,
    "status" "StatusPeminjaman" NOT NULL DEFAULT 'Dipinjam',
    "id_anggota" INTEGER NOT NULL,
    "id_petugas" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "peminjaman_pkey" PRIMARY KEY ("id_peminjaman")
);

-- CreateTable
CREATE TABLE "detail_peminjaman" (
    "id_detail" SERIAL NOT NULL,
    "id_peminjaman" INTEGER NOT NULL,
    "id_buku" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "detail_peminjaman_pkey" PRIMARY KEY ("id_detail")
);

-- CreateTable
CREATE TABLE "pengembalian" (
    "id_pengembalian" SERIAL NOT NULL,
    "id_peminjaman" INTEGER NOT NULL,
    "tanggal_dikembalikan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terlambat" INTEGER NOT NULL DEFAULT 0,
    "denda" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "pengembalian_pkey" PRIMARY KEY ("id_pengembalian")
);

-- CreateTable
CREATE TABLE "pengaturan_denda" (
    "id_pengaturan" SERIAL NOT NULL,
    "tarif_per_hari" DECIMAL(10,2) NOT NULL,
    "berlaku_sejak" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pengaturan_denda_pkey" PRIMARY KEY ("id_pengaturan")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_petugas_key" ON "users"("id_petugas");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_anggota_key" ON "users"("id_anggota");

-- CreateIndex
CREATE UNIQUE INDEX "anggota_email_key" ON "anggota"("email");

-- CreateIndex
CREATE INDEX "anggota_nama_idx" ON "anggota"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "kategori_nama_kategori_key" ON "kategori"("nama_kategori");

-- CreateIndex
CREATE UNIQUE INDEX "buku_isbn_key" ON "buku"("isbn");

-- CreateIndex
CREATE INDEX "buku_judul_idx" ON "buku"("judul");

-- CreateIndex
CREATE INDEX "peminjaman_status_idx" ON "peminjaman"("status");

-- CreateIndex
CREATE UNIQUE INDEX "pengembalian_id_peminjaman_key" ON "pengembalian"("id_peminjaman");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_petugas_fkey" FOREIGN KEY ("id_petugas") REFERENCES "petugas"("id_petugas") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_anggota_fkey" FOREIGN KEY ("id_anggota") REFERENCES "anggota"("id_anggota") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buku" ADD CONSTRAINT "buku_id_kategori_fkey" FOREIGN KEY ("id_kategori") REFERENCES "kategori"("id_kategori") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buku" ADD CONSTRAINT "buku_id_penerbit_fkey" FOREIGN KEY ("id_penerbit") REFERENCES "penerbit"("id_penerbit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buku" ADD CONSTRAINT "buku_id_penulis_fkey" FOREIGN KEY ("id_penulis") REFERENCES "penulis"("id_penulis") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_id_anggota_fkey" FOREIGN KEY ("id_anggota") REFERENCES "anggota"("id_anggota") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peminjaman" ADD CONSTRAINT "peminjaman_id_petugas_fkey" FOREIGN KEY ("id_petugas") REFERENCES "petugas"("id_petugas") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_peminjaman" ADD CONSTRAINT "detail_peminjaman_id_peminjaman_fkey" FOREIGN KEY ("id_peminjaman") REFERENCES "peminjaman"("id_peminjaman") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "detail_peminjaman" ADD CONSTRAINT "detail_peminjaman_id_buku_fkey" FOREIGN KEY ("id_buku") REFERENCES "buku"("id_buku") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pengembalian" ADD CONSTRAINT "pengembalian_id_peminjaman_fkey" FOREIGN KEY ("id_peminjaman") REFERENCES "peminjaman"("id_peminjaman") ON DELETE RESTRICT ON UPDATE CASCADE;
