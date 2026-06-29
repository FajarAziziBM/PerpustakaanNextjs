import Link from "next/link";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";

interface PaginationProps {
  basePath: string;
  currentPage: number;
  totalItems: number;
  pageSize?: number;
  /** Param lain yang harus dipertahankan saat pindah halaman, misal { q, status }. */
  preserveParams?: Record<string, string | undefined>;
}

function buildHref(basePath: string, page: number, preserveParams: Record<string, string | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(preserveParams)) {
    if (value) params.set(key, value);
  }
  params.set("page", String(page));
  return `${basePath}?${params.toString()}`;
}

export function Pagination({
  basePath,
  currentPage,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  preserveParams = {},
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems === 0) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  const baseBtn = "rounded-lg border px-3 py-1.5 text-sm font-medium";
  const enabledBtn = `${baseBtn} border-slate-300 text-slate-700 hover:bg-slate-50`;
  const disabledBtn = `${baseBtn} border-slate-200 text-slate-300`;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
      <p>
        Menampilkan {start}–{end} dari {totalItems} data
      </p>
      <div className="flex items-center gap-2">
        {hasPrev ? (
          <Link href={buildHref(basePath, currentPage - 1, preserveParams)} className={enabledBtn}>
            ← Sebelumnya
          </Link>
        ) : (
          <span className={disabledBtn}>← Sebelumnya</span>
        )}
        <span className="px-2 text-slate-600">
          Halaman {currentPage} / {totalPages}
        </span>
        {hasNext ? (
          <Link href={buildHref(basePath, currentPage + 1, preserveParams)} className={enabledBtn}>
            Berikutnya →
          </Link>
        ) : (
          <span className={disabledBtn}>Berikutnya →</span>
        )}
      </div>
    </div>
  );
}
