import { db } from "@/lib/db";
import type { ReportColumn, ReportResult, DateRange } from "./types";
import { buildDateRangeWhere } from "./types";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const columns: ReportColumn[] = [
  { key: "anggota", header: "Anggota", width: 22, flex: 1.3 },
  { key: "buku", header: "Buku", width: 32, flex: 2.3 },
  { key: "tanggal_dikembalikan", header: "Tgl Dikembalikan", width: 16, flex: 1 },
  { key: "terlambat", header: "Terlambat (hari)", width: 12, flex: 0.8 },
  { key: "denda", header: "Denda", width: 16, flex: 1 },
];

export async function getLaporanPengembalian(range: DateRange = {}): Promise<ReportResult> {
  const items = await db.pengembalian.findMany({
    where: buildDateRangeWhere("tanggal_dikembalikan", range),
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
    title: "Laporan Pengembalian",
    subtitle: `${items.length} transaksi · Total denda: ${currency.format(totalDenda)}`,
    columns,
    rows,
  };
}
