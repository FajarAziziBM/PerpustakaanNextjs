import { db } from "@/lib/db";

/** Tarif default (Rp/hari/buku) jika belum ada baris pengaturan_denda sama sekali. */
export const DEFAULT_TARIF_PER_HARI = 1000;

/**
 * Mengambil tarif denda per hari yang sedang berlaku — yaitu baris
 * `pengaturan_denda` dengan `berlaku_sejak` paling baru. Lihat
 * docs/specification.md §3.8.
 */
export async function getActiveTarifDenda(): Promise<number> {
  const latest = await db.pengaturan_denda.findFirst({
    orderBy: { berlaku_sejak: "desc" },
  });
  return latest ? Number(latest.tarif_per_hari) : DEFAULT_TARIF_PER_HARI;
}
