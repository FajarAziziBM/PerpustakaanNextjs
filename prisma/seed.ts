import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL belum diatur.");
  }

  const adapter = new PrismaPg({ connectionString });
  const db = new PrismaClient({ adapter });

  const existing = await db.users.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Akun admin sudah ada, seeding dilewati.");
    await db.$disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);

  const petugas = await db.petugas.create({
    data: { nama: "Administrator" },
  });

  await db.users.create({
    data: {
      username: "admin",
      password_hash: passwordHash,
      role: "Admin",
      id_petugas: petugas.id_petugas,
    },
  });

  await db.pengaturan_denda.create({
    data: { tarif_per_hari: 1000 },
  });

  console.log("Seed selesai.");
  console.log("Login awal -> username: admin | password: admin123 (WAJIB diganti setelah login pertama).");

  await db.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
