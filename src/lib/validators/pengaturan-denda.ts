import { z } from "zod";

export const pengaturanDendaSchema = z.object({
  tarif_per_hari: z
    .string()
    .min(1, "Tarif wajib diisi.")
    .transform((v) => Number(v))
    .refine((v) => Number.isFinite(v) && v >= 0, { message: "Tarif harus berupa angka ≥ 0." }),
});

export type PengaturanDendaInput = z.infer<typeof pengaturanDendaSchema>;
