import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntityForm, type FieldConfig } from "@/components/entity-form";
import { updateBukuAction } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BukuEditPage({ params }: PageProps) {
  const { id } = await params;
  const [item, kategori, penerbit, penulis] = await Promise.all([
    db.buku.findUnique({ where: { id_buku: Number(id) } }),
    db.kategori.findMany({ orderBy: { nama_kategori: "asc" } }),
    db.penerbit.findMany({ orderBy: { nama_penerbit: "asc" } }),
    db.penulis.findMany({ orderBy: { nama_penulis: "asc" } }),
  ]);

  if (!item) notFound();

  const fields: FieldConfig[] = [
    { type: "text", name: "isbn", label: "ISBN", required: true },
    { type: "text", name: "judul", label: "Judul", required: true },
    {
      type: "select",
      name: "id_kategori",
      label: "Kategori",
      options: kategori.map((k) => ({ value: String(k.id_kategori), label: k.nama_kategori })),
    },
    {
      type: "select",
      name: "id_penerbit",
      label: "Penerbit",
      options: penerbit.map((p) => ({ value: String(p.id_penerbit), label: p.nama_penerbit })),
    },
    {
      type: "select",
      name: "id_penulis",
      label: "Penulis",
      options: penulis.map((p) => ({ value: String(p.id_penulis), label: p.nama_penulis })),
    },
    { type: "number", name: "tahun_terbit", label: "Tahun Terbit", step: "1" },
    { type: "number", name: "stok", label: "Stok", required: true, step: "1" },
    { type: "text", name: "lokasi_rak", label: "Lokasi Rak" },
  ];

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/buku" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Edit Buku</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={updateBukuAction.bind(null, item.id_buku)}
          fields={fields}
          defaultValues={{
            isbn: item.isbn,
            judul: item.judul,
            id_kategori: item.id_kategori ?? "",
            id_penerbit: item.id_penerbit ?? "",
            id_penulis: item.id_penulis ?? "",
            tahun_terbit: item.tahun_terbit ?? "",
            stok: item.stok,
            lokasi_rak: item.lokasi_rak ?? "",
          }}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  );
}
