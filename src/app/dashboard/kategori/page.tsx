import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ErrorBanner } from "@/components/error-banner";
import { deleteKategoriAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function KategoriPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const items = await db.kategori.findMany({ orderBy: { nama_kategori: "asc" } });

  return (
    <div>
      {error === "hapus-gagal" && (
        <ErrorBanner message="Kategori tidak bisa dihapus — kemungkinan masih dipakai oleh data Buku." />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Kategori Buku</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} kategori terdaftar.</p>
        </div>
        <Link
          href="/dashboard/kategori/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tambah Kategori
        </Link>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Nama Kategori</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_kategori}>
                <td className="px-4 py-3">{item.nama_kategori}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/kategori/${item.id_kategori}/edit`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteKategoriAction.bind(null, item.id_kategori)}>
                      <ConfirmSubmitButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-slate-500">
                  Belum ada data kategori.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
