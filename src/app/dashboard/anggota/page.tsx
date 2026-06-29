import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ErrorBanner } from "@/components/error-banner";
import { Pagination } from "@/components/pagination";
import { parsePageParam, getSkipTake } from "@/lib/pagination";
import { deleteAnggotaAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; error?: string; page?: string }>;
}

export default async function AnggotaPage({ searchParams }: PageProps) {
  const { q, error, page: pageParam } = await searchParams;
  const query = q?.trim();
  const page = parsePageParam(pageParam);
  const { skip, take } = getSkipTake(page);

  const where = query
    ? {
        OR: [
          { nama: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      }
    : undefined;

  const [totalItems, items] = await Promise.all([
    db.anggota.count({ where }),
    db.anggota.findMany({ where, orderBy: { nama: "asc" }, skip, take }),
  ]);

  return (
    <div>
      {error === "hapus-gagal" && (
        <ErrorBanner message="Anggota tidak bisa dihapus — kemungkinan masih memiliki histori peminjaman. Pertimbangkan menonaktifkan status-nya saja." />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Anggota</h1>
          <p className="mt-1 text-sm text-slate-500">{totalItems} anggota ditemukan.</p>
        </div>
        <Link
          href="/dashboard/anggota/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tambah Anggota
        </Link>
      </div>

      <form className="mt-4 flex gap-2" action="/dashboard/anggota">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Cari nama atau email..."
          className="block w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
        <button
          type="submit"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cari
        </button>
        {query && (
          <Link
            href="/dashboard/anggota"
            className="flex items-center px-2 text-sm text-slate-500 hover:text-slate-900"
          >
            Reset
          </Link>
        )}
      </form>

      <div className="mt-4 overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">No HP</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_anggota}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.nama}</td>
                <td className="px-4 py-3 text-slate-500">{item.email ?? "-"}</td>
                <td className="px-4 py-3">{item.no_hp ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      item.status === "Aktif"
                        ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                    }
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/anggota/${item.id_anggota}/edit`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteAnggotaAction.bind(null, item.id_anggota, query)}>
                      <ConfirmSubmitButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Tidak ada data anggota yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/dashboard/anggota"
        currentPage={page}
        totalItems={totalItems}
        preserveParams={{ q: query }}
      />
    </div>
  );
}
