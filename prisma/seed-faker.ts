import "dotenv/config";
import { faker } from "@faker-js/faker";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

// =========================
// CONFIG
// =========================
const BUKU_COUNT = 1000;
const ANGGOTA_COUNT = 1000;
const PETUGAS_COUNT = 20;
const KATEGORI_COUNT = 20;
const PENULIS_COUNT = 100;
const PENERBIT_COUNT = 50;
const PEMINJAMAN_COUNT = 300;

// =========================
// MAIN
// =========================
async function main() {
  console.log("🧨 RESET DATABASE DIMULAI...");

  // =========================
  // RESET (URUTAN PENTING FK SAFE)
  // =========================
  await db.detail_peminjaman.deleteMany();
  await db.pengembalian.deleteMany();
  await db.peminjaman.deleteMany();

  await db.users.deleteMany();

  await db.buku.deleteMany();
  await db.anggota.deleteMany();
  await db.petugas.deleteMany();

  await db.kategori.deleteMany();
  await db.penerbit.deleteMany();
  await db.penulis.deleteMany();

  await db.pengaturan_denda.deleteMany();

  console.log("✅ RESET SELESAI, MULAI SEEDING...");

  // =========================
  // PETUGAS
  // =========================
  await db.petugas.createMany({
    data: Array.from({ length: PETUGAS_COUNT }).map(() => ({
      nama: faker.person.fullName(),
      no_hp: faker.phone.number(),
    })),
  });

  const petugasList = await db.petugas.findMany();
  if (petugasList.length === 0) {
    throw new Error("Gagal membuat data petugas awal.");
  }
  const firstPetugas = petugasList[0]!;

  // =========================
  // ADMIN USER
  // =========================
  const adminHash = await bcrypt.hash("admin123", 10);

  await db.users.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password_hash: adminHash,
      role: "Admin",
      id_petugas: firstPetugas.id_petugas,
    },
  });

  // =========================
  // ANGGOTA
  // =========================
  await db.anggota.createMany({
    data: Array.from({ length: ANGGOTA_COUNT }).map(() => ({
      nama: faker.person.fullName(),
      jenis_kelamin: faker.helpers.arrayElement(["L", "P"]),
      alamat: faker.location.streetAddress(),
      no_hp: faker.phone.number(),
      email: faker.internet.email(),
      status: "Aktif",
    })),
  });

  const anggotaList = await db.anggota.findMany();

  // =========================
  // KATEGORI
  // =========================
  await db.kategori.createMany({
    data: Array.from({ length: KATEGORI_COUNT }).map(() => ({
      nama_kategori:
        faker.commerce.department() + "-" + faker.string.uuid().slice(0, 4),
    })),
  });

  const kategoriList = await db.kategori.findMany();

  // =========================
  // PENULIS
  // =========================
  await db.penulis.createMany({
    data: Array.from({ length: PENULIS_COUNT }).map(() => ({
      nama_penulis: faker.person.fullName(),
    })),
  });

  const penulisList = await db.penulis.findMany();

  // =========================
  // PENERBIT
  // =========================
  await db.penerbit.createMany({
    data: Array.from({ length: PENERBIT_COUNT }).map(() => ({
      nama_penerbit: faker.company.name(),
      alamat: faker.location.streetAddress(),
      telepon: faker.phone.number(),
    })),
  });

  const penerbitList = await db.penerbit.findMany();

  // =========================
  // BUKU (1000 DATA)
  // =========================
  await db.buku.createMany({
    data: Array.from({ length: BUKU_COUNT }).map(() => ({
      isbn: faker.commerce.isbn(),
      judul: faker.commerce.productName(),
      tahun_terbit: faker.number.int({ min: 1990, max: 2025 }),
      stok: faker.number.int({ min: 1, max: 30 }),
      lokasi_rak: `R${faker.number.int({ min: 1, max: 20 })}`,
      id_kategori: faker.helpers.arrayElement(kategoriList).id_kategori,
      id_penerbit: faker.helpers.arrayElement(penerbitList).id_penerbit,
      id_penulis: faker.helpers.arrayElement(penulisList).id_penulis,
      updated_at: new Date(),
    })),
  });

  const bukuList = await db.buku.findMany();

  // =========================
  // PEMINJAMAN
  // =========================
  await db.peminjaman.createMany({
    data: Array.from({ length: PEMINJAMAN_COUNT }).map(() => {
      const pinjamDate = faker.date.past();
      const kembaliDate = faker.date.soon({ refDate: pinjamDate });

      return {
        tanggal_pinjam: pinjamDate,
        tanggal_kembali: kembaliDate,
        status: faker.helpers.arrayElement(["Dipinjam", "Selesai"]),
        id_anggota: faker.helpers.arrayElement(anggotaList).id_anggota,
        id_petugas: faker.helpers.arrayElement(petugasList).id_petugas,
      };
    }),
  });

  const peminjamanList = await db.peminjaman.findMany();

  // =========================
  // DETAIL PEMINJAMAN
  // =========================
  await db.detail_peminjaman.createMany({
    data: peminjamanList.flatMap((pinjam) => {
      const jumlahItem = faker.number.int({ min: 1, max: 3 });

      return Array.from({ length: jumlahItem }).map(() => ({
        id_peminjaman: pinjam.id_peminjaman,
        id_buku: faker.helpers.arrayElement(bukuList).id_buku,
        jumlah: faker.number.int({ min: 1, max: 2 }),
      }));
    }),
  });

  // =========================
  // PENGEMBALIAN (hanya untuk peminjaman berstatus "Selesai")
  // =========================
  // PENTING: jangan pakai filter acak independen di sini — peminjaman yang masih
  // berstatus "Dipinjam" TIDAK BOLEH punya baris pengembalian, karena aplikasi
  // (lihat src/app/dashboard/peminjaman/actions.ts & pengembalian/actions.ts)
  // mengasumsikan invariant: status "Selesai" <=> ada baris pengembalian.
  // Melanggar ini menyebabkan error P2002 (unique constraint) saat user mencoba
  // memproses pengembalian, dan error P2003 (FK constraint) saat membatalkan.
  await db.pengembalian.createMany({
    data: peminjamanList
      .filter((pinjam) => pinjam.status === "Selesai")
      .map((pinjam) => {
        const terlambat = faker.number.int({ min: 0, max: 10 });

        return {
          id_peminjaman: pinjam.id_peminjaman,
          tanggal_dikembalikan: faker.date.soon({
            refDate: pinjam.tanggal_kembali,
          }),
          terlambat,
          denda: terlambat * 1000,
        };
      }),
  });

  // =========================
  // PENGATURAN DENDA
  // =========================
  await db.pengaturan_denda.create({
    data: { tarif_per_hari: 1000 },
  });

  console.log("🎉 SEED FAKER SELESAI!");
  console.log("Login admin: admin / admin123");

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});