import Link from "next/link";
import { db } from "@/lib/db";
import { PeminjamanForm } from "@/components/peminjaman-form";
import { createPeminjamanAction } from "../actions";

const DEFAULT_LOAN_DAYS = 7;

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function PeminjamanBaruPage() {
  const [anggota, buku] = await Promise.all([
    db.anggota.findMany({ where: { status: "Aktif" }, orderBy: { nama: "asc" } }),
    db.buku.findMany({ orderBy: { judul: "asc" } }),
  ]);

  // Server Component: dieksekusi ulang setiap request (bukan di-memoize seperti
  // Client Component), jadi `Date.now()` di sini memang sengaja dihitung ulang
  // tiap kali halaman dibuka — bukan pelanggaran purity yang ditangkap rule ini
  // untuk komponen client. False-positive yang dikenal untuk Server Component.
  /* eslint-disable react-hooks/purity */
  const defaultTanggalKembali = formatDateInput(
    new Date(Date.now() + DEFAULT_LOAN_DAYS * 24 * 60 * 60 * 1000)
  );
  /* eslint-enable react-hooks/purity */

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/peminjaman" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Peminjaman Baru</h1>
      <p className="mt-1 text-sm text-slate-500">
        Default tanggal kembali {DEFAULT_LOAN_DAYS} hari dari sekarang — bisa diubah sesuai kebijakan.
      </p>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <PeminjamanForm
          action={createPeminjamanAction}
          anggotaOptions={anggota.map((a) => ({ id_anggota: a.id_anggota, nama: a.nama }))}
          bukuOptions={buku.map((b) => ({ id_buku: b.id_buku, judul: b.judul, stok: b.stok }))}
          defaultTanggalKembali={defaultTanggalKembali}
        />
      </div>
    </div>
  );
}
