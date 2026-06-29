import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ErrorBanner } from "@/components/error-banner";
import { Pagination } from "@/components/pagination";
import { parsePageParam, getSkipTake } from "@/lib/pagination";
import { deletePenerbitAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; page?: string }>;
}

export default async function PenerbitPage({ searchParams }: PageProps) {
  const { error, page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);
  const { skip, take } = getSkipTake(page);

  const [totalItems, items] = await Promise.all([
    db.penerbit.count(),
    db.penerbit.findMany({ orderBy: { nama_penerbit: "asc" }, skip, take }),
  ]);

  return (
    <div>
      {error === "hapus-gagal" && (
        <ErrorBanner message="Penerbit tidak bisa dihapus — kemungkinan masih dipakai oleh data Buku." />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Penerbit</h1>
          <p className="mt-1 text-sm text-slate-500">{totalItems} penerbit terdaftar.</p>
        </div>
        <Link
          href="/dashboard/penerbit/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tambah Penerbit
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Penerbit</th>
              <th className="px-4 py-3">Telepon</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_penerbit}>
                <td className="px-4 py-3">{item.nama_penerbit}</td>
                <td className="px-4 py-3">{item.telepon ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/penerbit/${item.id_penerbit}/edit`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deletePenerbitAction.bind(null, item.id_penerbit)}>
                      <ConfirmSubmitButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  Belum ada data penerbit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/dashboard/penerbit" currentPage={page} totalItems={totalItems} />
    </div>
  );
}
