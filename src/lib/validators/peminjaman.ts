import { z } from "zod";

export const peminjamanItemSchema = z.object({
  id_buku: z.coerce.number().int().positive("Pilih buku yang valid."),
  jumlah: z.coerce.number().int().min(1, "Jumlah minimal 1."),
});

export const peminjamanSchema = z.object({
  id_anggota: z.coerce.number().int().positive("Pilih anggota."),
  tanggal_kembali: z.string().min(1, "Tanggal kembali wajib diisi."),
  items: z
    .array(peminjamanItemSchema)
    .min(1, "Tambahkan minimal satu buku.")
    .refine((items) => new Set(items.map((i) => i.id_buku)).size === items.length, {
      message: "Buku yang sama tidak boleh dipilih lebih dari sekali — gabungkan jumlahnya dalam satu baris.",
    }),
});

export type PeminjamanInput = z.infer<typeof peminjamanSchema>;
