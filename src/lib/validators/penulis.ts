import { z } from "zod";

export const penulisSchema = z.object({
  nama_penulis: z.string().trim().min(1, "Nama penulis wajib diisi.").max(100),
});

export type PenulisInput = z.infer<typeof penulisSchema>;
