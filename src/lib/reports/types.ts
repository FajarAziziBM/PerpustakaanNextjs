export interface ReportColumn {
  /** Key untuk mengambil nilai dari row & dipakai sebagai key kolom Excel. */
  key: string;
  header: string;
  /** Lebar kolom Excel (jumlah karakter, opsional). */
  width?: number;
  /** Proporsi lebar kolom PDF (flex), default 1. */
  flex?: number;
}

export interface ReportResult {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  rows: Record<string, string | number>[];
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

/**
 * Membangun filter Prisma `where` untuk rentang tanggal pada satu kolom.
 * Mengembalikan undefined jika tidak ada filter (artinya: semua data).
 */
export function buildDateRangeWhere(field: string, range: DateRange): Record<string, unknown> | undefined {
  if (!range.from && !range.to) return undefined;
  const condition: Record<string, Date> = {};
  if (range.from) condition.gte = range.from;
  if (range.to) condition.lte = range.to;
  return { [field]: condition };
}
