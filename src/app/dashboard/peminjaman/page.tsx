import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { batalkanPeminjamanAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ status?: string; error?: string }>;
}

const STATUS_TABS = [
  { value: "Dipinjam", label: "Sedang Dipinjam" },
  { value: "Selesai", label: "Selesai" },
  { value: "semua", label: "Semua" },
];

export default async function PeminjamanPage({ searchParams }: PageProps) {
  const { status, error } = await searchParams;
  const activeStatus = status === "Selesai" || status === "semua" ? status : "Dipinjam";

  const items = await db.peminjaman.findMany({
    where: activeStatus === "semua" ? undefined : { status: activeStatus },
    include: {
      anggota: true,
      petugas: true,
      detail: { include: { buku: true } },
    },
    orderBy: { tanggal_pinjam: "desc" },
  });

  const now = new Date();

  return (
    <div>
      {error === "batal-gagal" && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          Transaksi tidak bisa dibatalkan — kemungkinan sudah pernah diproses pengembaliannya.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Peminjaman</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} transaksi ditemukan.</p>
        </div>
        <Link
          href="/dashboard/peminjaman/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Peminjaman Baru
        </Link>
      </div>

      <div className="mt-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/peminjaman?status=${tab.value}`}
            className={
              activeStatus === tab.value
                ? "rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            }
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Anggota</th>
              <th className="px-4 py-3">Buku</th>
              <th className="px-4 py-3">Tgl Pinjam</th>
              <th className="px-4 py-3">Tgl Kembali</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Petugas</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const overdue = item.status === "Dipinjam" && item.tanggal_kembali < now;
              return (
                <tr key={item.id_peminjaman}>
                  <td className="px-4 py-3 font-medium text-slate-900">{item.anggota?.nama ?? "-"}</td>
                  <td className="px-4 py-3">
                    {(item.detail ?? [])
                      .map((d) => `${d.buku?.judul ?? "?"} (${d.jumlah})`)
                      .join(", ")}
                  </td>
                  <td className="px-4 py-3">{new Intl.DateTimeFormat("id-ID").format(item.tanggal_pinjam)}</td>
                  <td className="px-4 py-3">{new Intl.DateTimeFormat("id-ID").format(item.tanggal_kembali)}</td>
                  <td className="px-4 py-3">
                    {overdue ? (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                        Terlambat
                      </span>
                    ) : (
                      <span
                        className={
                          item.status === "Dipinjam"
                            ? "rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                            : "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                        }
                      >
                        {item.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.petugas?.nama ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      {item.status === "Dipinjam" && (
                        <>
                          <Link
                            href={`/dashboard/peminjaman/${item.id_peminjaman}/kembalikan`}
                            className="text-sm font-medium text-brand-600 hover:underline"
                          >
                            Kembalikan
                          </Link>
                          <form action={batalkanPeminjamanAction.bind(null, item.id_peminjaman)}>
                            <ConfirmSubmitButton
                              confirmText="Batalkan peminjaman ini? Stok buku akan dikembalikan."
                            >
                              Batalkan
                            </ConfirmSubmitButton>
                          </form>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Tidak ada data peminjaman.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
