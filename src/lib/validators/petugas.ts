import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const petugasCreateSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(100),
  no_hp: optionalString,
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50)
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore."),
  password: z.string().min(6, "Password minimal 6 karakter."),
  role: z.union([z.literal("Admin"), z.literal("Petugas")]),
});

export const petugasUpdateSchema = z.object({
  nama: z.string().trim().min(1, "Nama wajib diisi.").max(100),
  no_hp: optionalString,
  username: z
    .string()
    .trim()
    .min(3, "Username minimal 3 karakter.")
    .max(50)
    .regex(/^[a-zA-Z0-9_.]+$/, "Username hanya boleh huruf, angka, titik, dan underscore."),
  role: z.union([z.literal("Admin"), z.literal("Petugas")]),
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .refine((v) => v === undefined || v.length >= 6, {
      message: "Password baru minimal 6 karakter (kosongkan jika tidak ingin mengganti).",
    }),
});

export type PetugasCreateInput = z.infer<typeof petugasCreateSchema>;
export type PetugasUpdateInput = z.infer<typeof petugasUpdateSchema>;
