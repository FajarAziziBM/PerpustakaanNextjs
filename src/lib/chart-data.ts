import { db } from "@/lib/db";

export interface MonthlyPoint {
  /** Format: "Jan 25", "Feb 25", dst */
  label: string;
  peminjaman: number;
  pengembalian: number;
  denda: number;
}

export interface ChartData {
  monthly: MonthlyPoint[];
  topKategori: { label: string; count: number }[];
  statusRatio: { dipinjam: number; selesai: number };
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Mengembalikan Date yang merupakan awal hari pertama bulan berjalan, N bulan yang lalu. */
function startOfMonth(offsetMonths: number): Date {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - offsetMonths, 1);
  return d;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
}

export async function getChartData(): Promise<ChartData> {
  const MONTHS = 12;
  const since = startOfMonth(MONTHS - 1); // awal bulan pertama dari 12 bulan terakhir

  const [peminjamanRows, pengembalianRows, bukuKategori, statusCounts] = await Promise.all([
    db.peminjaman.findMany({
      where: { tanggal_pinjam: { gte: since } },
      select: { tanggal_pinjam: true },
    }),
    db.pengembalian.findMany({
      where: { tanggal_dikembalikan: { gte: since } },
      select: { tanggal_dikembalikan: true, denda: true },
    }),
    // Top 8 kategori berdasarkan jumlah buku
    db.kategori.findMany({
      include: { _count: { select: { buku: true } } },
      orderBy: { buku: { _count: "desc" } },
      take: 8,
    }),
    // Rasio status peminjaman (semua waktu)
    db.peminjaman.groupBy({ by: ["status"], _count: true }),
  ]);

  // Bangun peta bulan → counter (12 bulan)
  const monthMap = new Map<string, MonthlyPoint>();
  for (let i = MONTHS - 1; i >= 0; i--) {
    const d = startOfMonth(i);
    const key = monthKey(d);
    monthMap.set(key, { label: monthLabel(d), peminjaman: 0, pengembalian: 0, denda: 0 });
  }

  for (const row of peminjamanRows) {
    const key = monthKey(row.tanggal_pinjam);
    const point = monthMap.get(key);
    if (point) point.peminjaman += 1;
  }

  for (const row of pengembalianRows) {
    const key = monthKey(row.tanggal_dikembalikan);
    const point = monthMap.get(key);
    if (point) {
      point.pengembalian += 1;
      point.denda += Number(row.denda);
    }
  }

  const topKategori = bukuKategori.map((k) => ({
    label: k.nama_kategori,
    count: (k as typeof k & { _count: { buku: number } })._count.buku,
  }));

  const statusRatio = { dipinjam: 0, selesai: 0 };
  for (const s of statusCounts) {
    if (s.status === "Dipinjam") statusRatio.dipinjam = s._count;
    if (s.status === "Selesai") statusRatio.selesai = s._count;
  }

  return { monthly: Array.from(monthMap.values()), topKategori, statusRatio };
}
