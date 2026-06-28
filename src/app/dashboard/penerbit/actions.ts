"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { penerbitSchema } from "@/lib/validators/penerbit";

export async function createPenerbitAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = penerbitSchema.safeParse({
    nama_penerbit: formData.get("nama_penerbit"),
    alamat: formData.get("alamat"),
    telepon: formData.get("telepon"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.penerbit.create({ data: parsed.data });
  revalidatePath("/dashboard/penerbit");
  redirect("/dashboard/penerbit");
}

export async function updatePenerbitAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = penerbitSchema.safeParse({
    nama_penerbit: formData.get("nama_penerbit"),
    alamat: formData.get("alamat"),
    telepon: formData.get("telepon"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.penerbit.update({ where: { id_penerbit: id }, data: parsed.data });
  revalidatePath("/dashboard/penerbit");
  redirect("/dashboard/penerbit");
}

export async function deletePenerbitAction(id: number): Promise<void> {
  try {
    await db.penerbit.delete({ where: { id_penerbit: id } });
  } catch {
    // Kemungkinan masih direferensikan oleh data Buku.
  }
  revalidatePath("/dashboard/penerbit");
}
