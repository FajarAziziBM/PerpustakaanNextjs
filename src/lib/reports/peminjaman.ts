import { db } from "@/lib/db";
import type { ReportColumn, ReportResult, DateRange } from "./types";
import { buildDateRangeWhere } from "./types";

const columns: ReportColumn[] = [
  { key: "anggota", header: "Anggota", width: 22, flex: 1.3 },
  { key: "buku", header: "Buku", width: 36, flex: 2.5 },
  { key: "tanggal_pinjam", header: "Tgl Pinjam", width: 14, flex: 1 },
  { key: "tanggal_kembali", header: "Tgl Kembali", width: 14, flex: 1 },
  { key: "status", header: "Status", width: 10, flex: 0.7 },
  { key: "petugas", header: "Petugas", width: 18, flex: 1 },
];

export async function getLaporanPeminjaman(range: DateRange = {}): Promise<ReportResult> {
  const items = await db.peminjaman.findMany({
    where: buildDateRangeWhere("tanggal_pinjam", range),
    include: { anggota: true, petugas: true, detail: { include: { buku: true } } },
    orderBy: { tanggal_pinjam: "desc" },
  });

  const formatter = new Intl.DateTimeFormat("id-ID");

  const rows = items.map((p) => ({
    anggota: p.anggota?.nama ?? "-",
    buku: (p.detail ?? []).map((d) => `${d.buku?.judul ?? "?"} (${d.jumlah})`).join(", "),
    tanggal_pinjam: formatter.format(p.tanggal_pinjam),
    tanggal_kembali: formatter.format(p.tanggal_kembali),
    status: p.status,
    petugas: p.petugas?.nama ?? "-",
  }));

  const rentang =
    range.from || range.to
      ? ` (${range.from ? formatter.format(range.from) : "awal"} – ${range.to ? formatter.format(range.to) : "sekarang"})`
      : "";

  return {
    title: "Laporan Peminjaman",
    subtitle: `${items.length} transaksi${rentang}`,
    columns,
    rows,
  };
}
