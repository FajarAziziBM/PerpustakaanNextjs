import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getActiveTarifDenda } from "@/lib/pengaturan-denda";
import { PengembalianForm } from "@/components/pengembalian-form";
import { prosesPengembalianAction } from "@/app/dashboard/pengembalian/actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function KembalikanPage({ params }: PageProps) {
  const { id } = await params;
  const peminjaman = await db.peminjaman.findUnique({
    where: { id_peminjaman: Number(id) },
    include: { anggota: true, detail: { include: { buku: true } } },
  });

  if (!peminjaman || peminjaman.status !== "Dipinjam") {
    notFound();
  }

  const tarif = await getActiveTarifDenda();
  const totalBuku = (peminjaman.detail ?? []).reduce((sum, d) => sum + d.jumlah, 0);

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/peminjaman" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Proses Pengembalian</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <dl className="mb-5 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Anggota</dt>
            <dd className="text-right font-medium text-slate-900">{peminjaman.anggota?.nama}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Buku</dt>
            <dd className="text-right font-medium text-slate-900">
              {(peminjaman.detail ?? [])
                .map((d) => `${d.buku?.judul ?? "?"} (${d.jumlah})`)
                .join(", ")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Tanggal Kembali (target)</dt>
            <dd className="font-medium text-slate-900">
              {new Intl.DateTimeFormat("id-ID").format(peminjaman.tanggal_kembali)}
            </dd>
          </div>
        </dl>

        <PengembalianForm
          action={prosesPengembalianAction.bind(null, peminjaman.id_peminjaman)}
          defaultTanggal={formatDateInput(new Date())}
          tanggalKembaliTarget={formatDateInput(peminjaman.tanggal_kembali)}
          tarifPerHari={tarif}
          totalBuku={totalBuku}
        />
      </div>
    </div>
  );
}
