import Link from "next/link";
import { EntityForm, type FieldConfig } from "@/components/entity-form";
import { createAnggotaAction } from "../actions";

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

export default function AnggotaBaruPage() {
  return (
    <div className="max-w-lg">
      <Link href="/dashboard/anggota" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Tambah Anggota</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={createAnggotaAction}
          fields={fields}
          defaultValues={{ status: "Aktif" }}
          submitLabel="Simpan"
        />
      </div>
    </div>
  );
}
