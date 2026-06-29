import Link from "next/link";
import { db } from "@/lib/db";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ErrorBanner } from "@/components/error-banner";
import { deleteBukuAction } from "./actions";

interface PageProps {
  searchParams: Promise<{ q?: string; error?: string }>;
}

export default async function BukuPage({ searchParams }: PageProps) {
  const { q, error } = await searchParams;
  const query = q?.trim();

  const items = await db.buku.findMany({
    where: query
      ? {
          OR: [
            { judul: { contains: query, mode: "insensitive" } },
            { isbn: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { kategori: true, penerbit: true, penulis: true },
    orderBy: { judul: "asc" },
  });

  return (
    <div>
      {error === "hapus-gagal" && (
        <ErrorBanner message="Buku tidak bisa dihapus — kemungkinan masih memiliki histori peminjaman." />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Buku</h1>
          <p className="mt-1 text-sm text-slate-500">{items.length} buku ditemukan.</p>
        </div>
        <Link
          href="/dashboard/buku/baru"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          + Tambah Buku
        </Link>
      </div>

      <form className="mt-4 flex gap-2" action="/dashboard/buku">
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Cari judul atau ISBN..."
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
            href="/dashboard/buku"
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
              <th className="px-4 py-3">Judul</th>
              <th className="px-4 py-3">ISBN</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Penulis</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id_buku}>
                <td className="px-4 py-3 font-medium text-slate-900">{item.judul}</td>
                <td className="px-4 py-3 text-slate-500">{item.isbn}</td>
                <td className="px-4 py-3">{item.kategori?.nama_kategori ?? "-"}</td>
                <td className="px-4 py-3">{item.penulis?.nama_penulis ?? "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      item.stok > 0
                        ? "rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
                    }
                  >
                    {item.stok}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/dashboard/buku/${item.id_buku}/edit`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <form action={deleteBukuAction.bind(null, item.id_buku, query)}>
                      <ConfirmSubmitButton />
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                  Tidak ada data buku yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
