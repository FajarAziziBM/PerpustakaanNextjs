import Link from "next/link";
import { EntityForm } from "@/components/entity-form";
import { createPenulisAction } from "../actions";

export default function PenulisBaruPage() {
  return (
    <div className="max-w-md">
      <Link href="/dashboard/penulis" className="text-sm text-slate-500 hover:text-slate-900">
        ← Kembali
      </Link>
      <h1 className="mt-2 text-lg font-semibold text-slate-900">Tambah Penulis</h1>

      <div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <EntityForm
          action={createPenulisAction}
          fields={[{ type: "text", name: "nama_penulis", label: "Nama Penulis", required: true }]}
          submitLabel="Simpan"
        />
      </div>
    </div>
  );
}
