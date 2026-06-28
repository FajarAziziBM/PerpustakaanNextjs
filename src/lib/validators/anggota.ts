import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const anggotaSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(100),
  jenis_kelamin: z
    .union([z.literal("L"), z.literal("P"), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v === undefined ? undefined : v)),
  alamat: optionalString,
  no_hp: optionalString,
  email: optionalString.refine(
    (v) => v === undefined || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    { message: "Format email tidak valid." }
  ),
  status: z.union([z.literal("Aktif"), z.literal("Nonaktif")]).default("Aktif"),
});

export type AnggotaInput = z.infer<typeof anggotaSchema>;
