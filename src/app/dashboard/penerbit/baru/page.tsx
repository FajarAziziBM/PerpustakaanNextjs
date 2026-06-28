import Link from "next/link";
import { EntityForm } from "@/components/entity-form";
import { createPenerbitAction } from "../actions";

export default function PenerbitBaruPage() {
  return (
    <div className="max-w-md">
      <Link href="/dashboard/penerbit" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Tambah Penerbit</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={createPenerbitAction}
          fields={[
            { type: "text", name: "nama_penerbit", label: "Nama Penerbit", required: true },
            { type: "textarea", name: "alamat", label: "Alamat" },
            { type: "text", name: "telepon", label: "Telepon" },
          ]}
          submitLabel="Simpan"
        />
      </div>
    </div>
  );
}
