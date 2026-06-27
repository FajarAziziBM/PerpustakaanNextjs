import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function PortalPage() {
  const session = await getSession();
  if (!session) return null; // sudah dijaga oleh layout & proxy

  const anggota = await db.anggota.findUnique({
    where: { id_anggota: session.ref_id },
    include: {
      peminjaman: {
        orderBy: { tanggal_pinjam: "desc" },
        take: 5,
        include: { detail: { include: { buku: true } } },
      },
    },
  });

  const riwayat = anggota?.peminjaman ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-semibold text-slate-900">Profil Saya</h1>
        <div className="mt-3 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">Nama</dt>
              <dd className="text-sm font-medium text-slate-900">{anggota?.nama ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Email</dt>
              <dd className="text-sm font-medium text-slate-900">{anggota?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Status</dt>
              <dd className="text-sm font-medium text-slate-900">{anggota?.status ?? "-"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Riwayat Peminjaman Terakhir</h2>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          {riwayat.length > 0 ? (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Tanggal Pinjam</th>
                  <th className="px-4 py-3">Buku</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {riwayat.map((p) => (
                  <tr key={p.id_peminjaman}>
                    <td className="px-4 py-3">
                      {new Intl.DateTimeFormat("id-ID").format(p.tanggal_pinjam)}
                    </td>
                    <td className="px-4 py-3">
                      {(p.detail ?? []).map((d) => d.buku?.judul ?? "Buku tidak ditemukan").join(", ")}
                    </td>
                    <td className="px-4 py-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-4 py-6 text-sm text-slate-500">Belum ada riwayat peminjaman.</p>
          )}
        </div>
      </section>

      <p className="text-sm text-slate-400">
        Fitur reservasi &amp; perpanjangan mandiri akan tersedia pada Fase 3 (lihat{" "}
        <code>docs/roadmap.md</code>).
      </p>
    </div>
  );
}
