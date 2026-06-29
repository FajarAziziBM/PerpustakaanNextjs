"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tryDelete } from "@/lib/delete-helpers";
import type { ActionState } from "@/lib/action-state";
import { kategoriSchema } from "@/lib/validators/kategori";

export async function createKategoriAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = kategoriSchema.safeParse({
    nama_kategori: formData.get("nama_kategori"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.kategori.create({ data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. Nama kategori mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/kategori");
  redirect("/dashboard/kategori");
}

export async function updateKategoriAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = kategoriSchema.safeParse({
    nama_kategori: formData.get("nama_kategori"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  try {
    await db.kategori.update({ where: { id_kategori: id }, data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. Nama kategori mungkin sudah dipakai." };
  }

  revalidatePath("/dashboard/kategori");
  redirect("/dashboard/kategori");
}

export async function deleteKategoriAction(id: number): Promise<void> {
  const success = await tryDelete(() => db.kategori.delete({ where: { id_kategori: id } }));
  revalidatePath("/dashboard/kategori");
  if (!success) {
    redirect("/dashboard/kategori?error=hapus-gagal");
  }
}
