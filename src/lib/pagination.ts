export const DEFAULT_PAGE_SIZE = 15;

/** Parse query param `page` jadi integer ≥ 1 (fallback ke 1 kalau tidak valid). */
export function parsePageParam(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function getSkipTake(page: number, pageSize: number = DEFAULT_PAGE_SIZE): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

export function getTotalPages(totalItems: number, pageSize: number = DEFAULT_PAGE_SIZE): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Memastikan `page` tidak melebihi totalPages (misal karena data berkurang
 * setelah dihapus, atau user mengetik nomor halaman besar secara manual).
 */
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(page, 1), totalPages);
}
