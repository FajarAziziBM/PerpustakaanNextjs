import { db } from "@/lib/db";
import type { ReportColumn, ReportResult, DateRange } from "./types";

const columns: ReportColumn[] = [
  { key: "isbn", header: "ISBN", width: 16, flex: 1 },
  { key: "judul", header: "Judul", width: 32, flex: 2 },
  { key: "kategori", header: "Kategori", width: 18, flex: 1 },
  { key: "penulis", header: "Penulis", width: 18, flex: 1 },
  { key: "penerbit", header: "Penerbit", width: 18, flex: 1 },
  { key: "tahun_terbit", header: "Tahun", width: 8, flex: 0.5 },
  { key: "stok", header: "Stok", width: 8, flex: 0.5 },
  { key: "lokasi_rak", header: "Lokasi Rak", width: 14, flex: 1 },
];

export async function getLaporanBuku(_range: DateRange = {}): Promise<ReportResult> {
  const items = await db.buku.findMany({
    include: { kategori: true, penerbit: true, penulis: true },
    orderBy: { judul: "asc" },
  });

  const rows = items.map((b) => ({
    isbn: b.isbn,
    judul: b.judul,
    kategori: b.kategori?.nama_kategori ?? "-",
    penulis: b.penulis?.nama_penulis ?? "-",
    penerbit: b.penerbit?.nama_penerbit ?? "-",
    tahun_terbit: b.tahun_terbit ?? "-",
    stok: b.stok,
    lokasi_rak: b.lokasi_rak ?? "-",
  }));

  return { title: "Laporan Buku", subtitle: `${items.length} buku`, columns, rows };
}
