"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import type { ActionState } from "@/lib/action-state";
import { petugasCreateSchema, petugasUpdateSchema } from "@/lib/validators/petugas";

export async function createPetugasAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = petugasCreateSchema.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existing = await db.users.findUnique({ where: { username: parsed.data.username } });
  if (existing) {
    return { errors: { username: ["Username sudah dipakai, gunakan username lain."] } };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  try {
    await db.$transaction(async (tx) => {
      const petugas = await tx.petugas.create({
        data: { nama: parsed.data.nama, no_hp: parsed.data.no_hp },
      });
      await tx.users.create({
        data: {
          username: parsed.data.username,
          password_hash: passwordHash,
          role: parsed.data.role,
          id_petugas: petugas.id_petugas,
        },
      });
    });
  } catch {
    return { message: "Gagal menyimpan data petugas. Coba lagi." };
  }

  revalidatePath("/dashboard/petugas");
  redirect("/dashboard/petugas");
}

export async function updatePetugasAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = petugasUpdateSchema.safeParse({
    nama: formData.get("nama"),
    no_hp: formData.get("no_hp"),
    username: formData.get("username"),
    role: formData.get("role"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const existingUsername = await db.users.findUnique({ where: { username: parsed.data.username } });
  if (existingUsername && existingUsername.id_petugas !== id) {
    return { errors: { username: ["Username sudah dipakai, gunakan username lain."] } };
  }

  // Petugas bisa saja belum punya akun login sama sekali (misalnya berasal dari
  // data impor/seed yang dibuat langsung di tabel `petugas`). Dalam kasus itu kita
  // perlu membuat akun barunya (upsert), dan password WAJIB diisi karena belum ada
  // password_hash sebelumnya untuk dipertahankan.
  const existingAccount = await db.users.findUnique({ where: { id_petugas: id } });
  if (!existingAccount && !parsed.data.password) {
    return {
      errors: {
        password: ["Petugas ini belum punya akun login — isi password untuk membuat akun baru."],
      },
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.petugas.update({
        where: { id_petugas: id },
        data: { nama: parsed.data.nama, no_hp: parsed.data.no_hp },
      });

      const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

      await tx.users.upsert({
        where: { id_petugas: id },
        update: {
          username: parsed.data.username,
          role: parsed.data.role,
          ...(passwordHash ? { password_hash: passwordHash } : {}),
        },
        create: {
          id_petugas: id,
          username: parsed.data.username,
          role: parsed.data.role,
          // passwordHash dijamin terisi di sini karena validasi di atas mewajibkannya
          // saat akun belum ada.
          password_hash: passwordHash ?? (await hashPassword(crypto.randomUUID())),
        },
      });
    });
  } catch {
    return { message: "Gagal menyimpan data petugas. Coba lagi." };
  }

  revalidatePath("/dashboard/petugas");
  redirect("/dashboard/petugas");
}

export async function deletePetugasAction(id: number): Promise<void> {
  try {
    await db.$transaction(async (tx) => {
      // deleteMany dipakai (bukan delete) karena petugas ini mungkin belum
      // pernah punya akun di tabel users sama sekali — deleteMany tidak error
      // walau tidak ada baris yang cocok (count: 0).
      await tx.users.deleteMany({ where: { id_petugas: id } });
      await tx.petugas.delete({ where: { id_petugas: id } });
    });
  } catch {
    // Kemungkinan masih memiliki histori peminjaman yang ditangani petugas ini.
  }
  revalidatePath("/dashboard/petugas");
}
