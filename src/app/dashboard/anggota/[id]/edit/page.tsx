import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntityForm, type FieldConfig } from "@/components/entity-form";
import { updateAnggotaAction } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const fields: FieldConfig[] = [
  { type: "text", name: "nama", label: "Nama", required: true },
  {
    type: "select",
    name: "jenis_kelamin",
    label: "Jenis Kelamin",
    options: [
      { value: "L", label: "Laki-laki" },
      { value: "P", label: "Perempuan" },
    ],
  },
  { type: "textarea", name: "alamat", label: "Alamat" },
  { type: "text", name: "no_hp", label: "No HP" },
  { type: "email", name: "email", label: "Email" },
  {
    type: "select",
    name: "status",
    label: "Status",
    required: true,
    options: [
      { value: "Aktif", label: "Aktif" },
      { value: "Nonaktif", label: "Nonaktif" },
    ],
  },
];

export default async function AnggotaEditPage({ params }: PageProps) {
  const { id } = await params;
  const item = await db.anggota.findUnique({ where: { id_anggota: Number(id) } });
  if (!item) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/anggota" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Edit Anggota</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={updateAnggotaAction.bind(null, item.id_anggota)}
          fields={fields}
          defaultValues={{
            nama: item.nama,
            jenis_kelamin: item.jenis_kelamin ?? "",
            alamat: item.alamat ?? "",
            no_hp: item.no_hp ?? "",
            email: item.email ?? "",
            status: item.status,
          }}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  );
}
