import { db } from "@/lib/db";
import type { ReportColumn, ReportResult, DateRange } from "./types";

const columns: ReportColumn[] = [
  { key: "nama", header: "Nama", width: 28, flex: 2 },
  { key: "jenis_kelamin", header: "JK", width: 6, flex: 0.5 },
  { key: "email", header: "Email", width: 24, flex: 1.5 },
  { key: "no_hp", header: "No HP", width: 16, flex: 1 },
  { key: "tanggal_daftar", header: "Tanggal Daftar", width: 16, flex: 1 },
  { key: "status", header: "Status", width: 10, flex: 0.7 },
];

export async function getLaporanAnggota(_range: DateRange = {}): Promise<ReportResult> {
  const items = await db.anggota.findMany({ orderBy: { nama: "asc" } });
  const formatter = new Intl.DateTimeFormat("id-ID");

  const rows = items.map((a) => ({
    nama: a.nama,
    jenis_kelamin: a.jenis_kelamin ?? "-",
    email: a.email ?? "-",
    no_hp: a.no_hp ?? "-",
    tanggal_daftar: formatter.format(a.tanggal_daftar),
    status: a.status,
  }));

  return { title: "Laporan Anggota", subtitle: `${items.length} anggota`, columns, rows };
}
