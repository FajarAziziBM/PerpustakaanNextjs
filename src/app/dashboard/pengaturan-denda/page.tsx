import { db } from "@/lib/db";
import { DEFAULT_TARIF_PER_HARI } from "@/lib/pengaturan-denda";
import { EntityForm } from "@/components/entity-form";
import { createPengaturanDendaAction } from "./actions";

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function PengaturanDendaPage() {
  const riwayat = await db.pengaturan_denda.findMany({ orderBy: { berlaku_sejak: "desc" } });
  const aktif = riwayat[0];

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900">Pengaturan Denda</h1>
      <p className="mt-1 text-sm text-slate-500">
        Tarif denda dihitung per hari keterlambatan, dikalikan jumlah buku yang dipinjam (lihat{" "}
        <code>docs/specification.md</code> §3.8).
      </p>

      <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">Tarif yang sedang berlaku</p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">
          {currency.format(aktif ? Number(aktif.tarif_per_hari) : DEFAULT_TARIF_PER_HARI)}
          <span className="text-sm font-normal text-slate-500"> / hari / buku</span>
        </p>
        {!aktif && (
          <p className="mt-1 text-xs text-slate-400">
            Belum ada pengaturan tersimpan — menggunakan nilai default sistem.
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Ubah Tarif</h2>
          <p className="mt-1 text-xs text-slate-500">
            Menyimpan tarif baru tidak mengubah denda yang sudah terhitung sebelumnya.
          </p>
          <div className="mt-4">
            <EntityForm
              action={createPengaturanDendaAction}
              fields={[
                {
                  type: "number",
                  name: "tarif_per_hari",
                  label: "Tarif per hari (Rp)",
                  required: true,
                  step: "100",
                },
              ]}
              submitLabel="Simpan Tarif"
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Riwayat Tarif</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {riwayat.map((r) => (
              <li key={r.id_pengaturan} className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">
                  {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(r.berlaku_sejak)}
                </span>
                <span className="font-medium text-slate-900">{currency.format(Number(r.tarif_per_hari))}</span>
              </li>
            ))}
            {riwayat.length === 0 && <li className="text-slate-400">Belum ada riwayat.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
