/**
 * Menjalankan operasi delete dan mengembalikan apakah berhasil, tanpa
 * melempar exception ke pemanggil. Dipakai oleh seluruh delete action modul
 * master data supaya kegagalan (umumnya FK constraint — data masih dipakai
 * tabel lain) bisa dikabari ke user lewat redirect+query param, bukan diam-diam
 * tidak terjadi apa-apa di halaman.
 */
export async function tryDelete(operation: () => Promise<unknown>): Promise<boolean> {
  try {
    await operation();
    return true;
  } catch {
    return false;
  }
}
