import { db } from "@/lib/db";
import { Pagination } from "@/components/pagination";
import { parsePageParam, getSkipTake } from "@/lib/pagination";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function PengembalianPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);
  const { skip, take } = getSkipTake(page);

  const [totalItems, items, dendaAgg] = await Promise.all([
    db.pengembalian.count(),
    db.pengembalian.findMany({
      include: {
        peminjaman: {
          include: { anggota: true, detail: { include: { buku: true } } },
        },
      },
      orderBy: { tanggal_dikembalikan: "desc" },
      skip,
      take,
    }),
    db.pengembalian.aggregate({ _sum: { denda: true } }),
  ]);

  // Total denda dihitung dari SELURUH data (aggregate), bukan cuma baris yang
  // sedang ditampilkan di halaman ini — supaya angkanya tetap akurat walau
  // sudah dipaginasi.
  const totalDenda = Number(dendaAgg._sum.denda ?? 0);

  return (
    <div>
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Riwayat Pengembalian</h1>
        <p className="mt-1 text-sm text-slate-500">
          {totalItems} transaksi · Total denda tercatat: {currency.format(totalDenda)}
        </p>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Anggota</th>
              <th className="px-4 py-3">Buku</th>
              <th className="px-4 py-3">Tgl Dikembalikan</th>
              <th className="px-4 py-3">Terlambat</th>
              <th className="px-4 py-3">Denda</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_pengembalian}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {item.peminjaman?.anggota?.nama ?? "-"}
                </td>
                <td className="px-4 py-3">
                  {(item.peminjaman?.detail ?? [])
                    .map((d) => `${d.buku?.judul ?? "?"} (${d.jumlah})`)
                    .join(", ")}
                </td>
                <td className="px-4 py-3">
                  {new Intl.DateTimeFormat("id-ID").format(item.tanggal_dikembalikan)}
                </td>
                <td className="px-4 py-3">
                  {item.terlambat > 0 ? (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                      {item.terlambat} hari
                    </span>
                  ) : (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      Tepat waktu
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{currency.format(Number(item.denda))}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Belum ada riwayat pengembalian.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/dashboard/pengembalian" currentPage={page} totalItems={totalItems} />
    </div>
  );
}
