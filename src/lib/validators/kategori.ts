import { z } from "zod";

export const kategoriSchema = z.object({
  nama_kategori: z.string().trim().min(1, "Nama kategori wajib diisi.").max(100),
});

export type KategoriInput = z.infer<typeof kategoriSchema>;
