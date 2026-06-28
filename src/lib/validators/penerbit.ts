import { z } from "zod";

const optionalString = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

export const penerbitSchema = z.object({
  nama_penerbit: z.string().trim().min(1, "Nama penerbit wajib diisi.").max(100),
  alamat: optionalString,
  telepon: optionalString,
});

export type PenerbitInput = z.infer<typeof penerbitSchema>;
