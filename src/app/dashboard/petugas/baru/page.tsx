import Link from "next/link";
import { EntityForm, type FieldConfig } from "@/components/entity-form";
import { createPetugasAction } from "../actions";

const fields: FieldConfig[] = [
  { type: "text", name: "nama", label: "Nama", required: true },
  { type: "text", name: "no_hp", label: "No HP" },
  { type: "text", name: "username", label: "Username", required: true },
  { type: "password", name: "password", label: "Password", required: true, helpText: "Minimal 6 karakter." },
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
];

export default function PetugasBaruPage() {
  return (
    <div className="max-w-lg">
      <Link href="/dashboard/petugas" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Tambah Petugas</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={createPetugasAction}
          fields={fields}
          defaultValues={{ role: "Petugas" }}
          submitLabel="Simpan"
        />
      </div>
    </div>
  );
}
