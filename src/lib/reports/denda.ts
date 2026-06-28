import { db } from "@/lib/db";
import type { ReportColumn, ReportResult, DateRange } from "./types";
import { buildDateRangeWhere } from "./types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const columns: ReportColumn[] = [
  { key: "anggota", header: "Anggota", width: 24, flex: 1.5 },
  { key: "buku", header: "Buku", width: 32, flex: 2.3 },
  { key: "tanggal_dikembalikan", header: "Tgl Dikembalikan", width: 16, flex: 1 },
  { key: "terlambat", header: "Terlambat (hari)", width: 12, flex: 0.8 },
  { key: "denda", header: "Denda", width: 16, flex: 1 },
];

export async function getLaporanDenda(range: DateRange = {}): Promise<ReportResult> {
  const dateWhere = buildDateRangeWhere("tanggal_dikembalikan", range);

  const items = await db.pengembalian.findMany({
    where: { ...(dateWhere ?? {}), denda: { gt: 0 } },
    include: { peminjaman: { include: { anggota: true, detail: { include: { buku: true } } } } },
    orderBy: { tanggal_dikembalikan: "desc" },
  });

  const formatter = new Intl.DateTimeFormat("id-ID");

  const rows = items.map((item) => ({
    anggota: item.peminjaman?.anggota?.nama ?? "-",
    buku: (item.peminjaman?.detail ?? []).map((d) => `${d.buku?.judul ?? "?"} (${d.jumlah})`).join(", "),
    tanggal_dikembalikan: formatter.format(item.tanggal_dikembalikan),
    terlambat: item.terlambat,
    denda: currency.format(Number(item.denda)),
  }));

  const totalDenda = items.reduce((sum, item) => sum + Number(item.denda), 0);

  return {
    title: "Laporan Denda",
    subtitle: `${items.length} transaksi berdenda · Total: ${currency.format(totalDenda)}`,
    columns,
    rows,
  };
}
