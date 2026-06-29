"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tryDelete } from "@/lib/delete-helpers";
import type { ActionState } from "@/lib/action-state";
import { penulisSchema } from "@/lib/validators/penulis";

export async function createPenulisAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = penulisSchema.safeParse({ nama_penulis: formData.get("nama_penulis") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.penulis.create({ data: parsed.data });
  revalidatePath("/dashboard/penulis");
  redirect("/dashboard/penulis");
}

export async function updatePenulisAction(
  id: number,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = penulisSchema.safeParse({ nama_penulis: formData.get("nama_penulis") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.penulis.update({ where: { id_penulis: id }, data: parsed.data });
  revalidatePath("/dashboard/penulis");
  redirect("/dashboard/penulis");
}

export async function deletePenulisAction(id: number): Promise<void> {
  const success = await tryDelete(() => db.penulis.delete({ where: { id_penulis: id } }));
  revalidatePath("/dashboard/penulis");
  if (!success) {
    redirect("/dashboard/penulis?error=hapus-gagal");
  }
}
