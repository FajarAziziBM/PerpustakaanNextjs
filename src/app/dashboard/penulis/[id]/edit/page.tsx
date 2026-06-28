import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntityForm } from "@/components/entity-form";
import { updatePenulisAction } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PenulisEditPage({ params }: PageProps) {
  const { id } = await params;
  const item = await db.penulis.findUnique({ where: { id_penulis: Number(id) } });
  if (!item) notFound();

  return (
    <div className="max-w-md">
      <Link href="/dashboard/penulis" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Edit Penulis</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={updatePenulisAction.bind(null, item.id_penulis)}
          fields={[{ type: "text", name: "nama_penulis", label: "Nama Penulis", required: true }]}
          defaultValues={{ nama_penulis: item.nama_penulis }}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  );
}
