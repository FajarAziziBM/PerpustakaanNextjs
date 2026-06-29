"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tryDelete } from "@/lib/delete-helpers";
import type { ActionState } from "@/lib/action-state";
import { bukuSchema } from "@/lib/validators/buku";

function readBukuForm(formData: FormData) {
  return {
    isbn: formData.get("isbn"),
    judul: formData.get("judul"),
    tahun_terbit: formData.get("tahun_terbit"),
    stok: formData.get("stok"),
    lokasi_rak: formData.get("lokasi_rak"),
    id_kategori: formData.get("id_kategori"),
    id_penerbit: formData.get("id_penerbit"),
    id_penulis: formData.get("id_penulis"),
  };
}

export async function createBukuAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = bukuSchema.safeParse(readBukuForm(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await db.buku.create({ data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. ISBN mungkin sudah dipakai buku lain." };
  }

  revalidatePath("/dashboard/buku");
  redirect("/dashboard/buku");
}

export async function updateBukuAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = bukuSchema.safeParse(readBukuForm(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await db.buku.update({ where: { id_buku: id }, data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. ISBN mungkin sudah dipakai buku lain." };
  }

  revalidatePath("/dashboard/buku");
  redirect("/dashboard/buku");
}

export async function deleteBukuAction(id: number, currentSearch?: string): Promise<void> {
  const success = await tryDelete(() => db.buku.delete({ where: { id_buku: id } }));
  revalidatePath("/dashboard/buku");
  if (!success) {
    const params = new URLSearchParams(currentSearch);
    params.set("error", "hapus-gagal");
    redirect(`/dashboard/buku?${params.toString()}`);
  }
}
