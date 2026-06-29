"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tryDelete } from "@/lib/delete-helpers";
import type { ActionState } from "@/lib/action-state";
import { anggotaSchema } from "@/lib/validators/anggota";

function readAnggotaForm(formData: FormData) {
  return {
    nama: formData.get("nama"),
    jenis_kelamin: formData.get("jenis_kelamin"),
    alamat: formData.get("alamat"),
    no_hp: formData.get("no_hp"),
    email: formData.get("email"),
    status: formData.get("status"),
  };
}

export async function createAnggotaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = anggotaSchema.safeParse(readAnggotaForm(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await db.anggota.create({ data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. Email mungkin sudah dipakai anggota lain." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function updateAnggotaAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = anggotaSchema.safeParse(readAnggotaForm(formData));
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  try {
    await db.anggota.update({ where: { id_anggota: id }, data: parsed.data });
  } catch {
    return { message: "Gagal menyimpan. Email mungkin sudah dipakai anggota lain." };
  }

  revalidatePath("/dashboard/anggota");
  redirect("/dashboard/anggota");
}

export async function deleteAnggotaAction(id: number, currentQuery?: string): Promise<void> {
  const success = await tryDelete(() => db.anggota.delete({ where: { id_anggota: id } }));
  revalidatePath("/dashboard/anggota");
  if (!success) {
    const params = new URLSearchParams();
    if (currentQuery) params.set("q", currentQuery);
    params.set("error", "hapus-gagal");
    redirect(`/dashboard/anggota?${params.toString()}`);
  }
}
