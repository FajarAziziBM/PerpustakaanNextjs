import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const optionalId = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? Number(v) : undefined));

export const bukuSchema = z.object({
  isbn: z.string().trim().min(1, "ISBN wajib diisi.").max(30),
  judul: z.string().trim().min(1, "Judul wajib diisi.").max(150),
  tahun_terbit: z
    .string()
    .optional()
    .transform((v) => (v && v.length > 0 ? Number(v) : undefined))
    .refine((v) => v === undefined || (Number.isInteger(v) && v >= 1000 && v <= 9999), {
      message: "Tahun terbit tidak valid.",
    }),
  stok: z
    .string()
    .min(1, "Stok wajib diisi.")
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 0, { message: "Stok harus berupa angka ≥ 0." }),
  lokasi_rak: optionalString,
  id_kategori: optionalId,
  id_penerbit: optionalId,
  id_penulis: optionalId,
});

export type BukuInput = z.infer<typeof bukuSchema>;
