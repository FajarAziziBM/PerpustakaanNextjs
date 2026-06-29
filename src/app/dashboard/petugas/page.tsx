import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ErrorBanner } from "@/components/error-banner";
import { Pagination } from "@/components/pagination";
import { parsePageParam, getSkipTake } from "@/lib/pagination";
import { deletePetugasAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; page?: string }>;
}

export default async function PetugasPage({ searchParams }: PageProps) {
  const { error, page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);
  const { skip, take } = getSkipTake(page);

  const [totalItems, items] = await Promise.all([
    db.petugas.count(),
    db.petugas.findMany({ include: { user: true }, orderBy: { nama: "asc" }, skip, take }),
  ]);

  return (
    <div>
      {error === "hapus-gagal" && (
        <ErrorBanner message="Petugas tidak bisa dihapus — kemungkinan masih memiliki histori peminjaman yang ditangani." />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Petugas</h1>
          <p className="mt-1 text-sm text-slate-500">{totalItems} akun petugas/admin terdaftar.</p>
        </div>
        <Link
          href="/dashboard/petugas/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tambah Petugas
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">No HP</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_petugas}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.nama}</td>
                <td className="px-4 py-3 text-slate-500">{item.user?.username ?? "-"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {item.user?.role ?? "-"}
                  </span>
                </td>
                <td className="px-4 py-3">{item.no_hp ?? "-"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/petugas/${item.id_petugas}/edit`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deletePetugasAction.bind(null, item.id_petugas)}>
                      <ConfirmSubmitButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Belum ada data petugas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/dashboard/petugas" currentPage={page} totalItems={totalItems} />
    </div>
  );
}
