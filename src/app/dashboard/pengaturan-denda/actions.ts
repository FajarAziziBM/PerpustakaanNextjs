"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionState } from "@/lib/action-state";
import { pengaturanDendaSchema } from "@/lib/validators/pengaturan-denda";

export async function createPengaturanDendaAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = pengaturanDendaSchema.safeParse({
    tarif_per_hari: formData.get("tarif_per_hari"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  await db.pengaturan_denda.create({ data: { tarif_per_hari: parsed.data.tarif_per_hari } });

  revalidatePath("/dashboard/pengaturan-denda");
  return { message: "Tarif denda baru berhasil disimpan dan langsung berlaku.", success: true };
}
