import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntityForm } from "@/components/entity-form";
import { updateKategoriAction } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function KategoriEditPage({ params }: PageProps) {
  const { id } = await params;
  const item = await db.kategori.findUnique({ where: { id_kategori: Number(id) } });
  if (!item) notFound();

  return (
    <div className="max-w-md">
      <Link href="/dashboard/kategori" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Edit Kategori</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={updateKategoriAction.bind(null, item.id_kategori)}
          fields={[{ type: "text", name: "nama_kategori", label: "Nama Kategori", required: true }]}
          defaultValues={{ nama_kategori: item.nama_kategori }}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  );
}
