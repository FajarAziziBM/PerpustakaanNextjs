import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { EntityForm, type FieldConfig } from "@/components/entity-form";
import { updatePetugasAction } from "../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const fields: FieldConfig[] = [
  { type: "text", name: "nama", label: "Nama", required: true },
  { type: "text", name: "no_hp", label: "No HP" },
  { type: "text", name: "username", label: "Username", required: true },
  {
    type: "select",
    name: "role",
    label: "Level / Role",
    required: true,
    options: [
      { value: "Admin", label: "Admin" },
      { value: "Petugas", label: "Petugas" },
    ],
  },
  {
    type: "password",
    name: "password",
    label: "Password Baru",
    helpText: "Kosongkan jika tidak ingin mengganti password.",
  },
];

export default async function PetugasEditPage({ params }: PageProps) {
  const { id } = await params;
  const item = await db.petugas.findUnique({
    where: { id_petugas: Number(id) },
    include: { user: true },
  });
  if (!item) notFound();

  return (
    <div className="max-w-lg">
      <Link href="/dashboard/petugas" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Edit Petugas</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={updatePetugasAction.bind(null, item.id_petugas)}
          fields={fields}
          defaultValues={{
            nama: item.nama,
            no_hp: item.no_hp ?? "",
            username: item.user?.username ?? "",
            role: item.user?.role ?? "Petugas",
          }}
          submitLabel="Simpan Perubahan"
        />
      </div>
    </div>
  );
}
