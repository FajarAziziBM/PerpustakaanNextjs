const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Menghitung jumlah hari keterlambatan. Tidak pernah negatif.
 */
export function hitungKeterlambatanHari(tanggalKembaliTarget: Date, tanggalDikembalikan: Date): number {
  const selisihMs = tanggalDikembalikan.getTime() - tanggalKembaliTarget.getTime();
  const hari = Math.floor(selisihMs / MS_PER_DAY);
  return hari > 0 ? hari : 0;
}

/**
 * denda = terlambat (hari) x tarif_per_hari x jumlah_buku
 * Lihat docs/specification.md §3.8 untuk aturan bisnis lengkap.
 */
export function hitungDenda(terlambatHari: number, tarifPerHari: number, jumlahBuku: number): number {
  if (terlambatHari <= 0) return 0;
  return terlambatHari * tarifPerHari * jumlahBuku;
}
