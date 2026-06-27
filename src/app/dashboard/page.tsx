import { db } from "@/lib/db";

async function getStats() {
  const [jumlahBuku, jumlahAnggota, sedangDipinjam, terlambat, totalDendaRaw] = await Promise.all([
    db.buku.count(),
    db.anggota.count(),
    db.peminjaman.count({ where: { status: "Dipinjam" } }),
    db.peminjaman.count({
      where: { status: "Dipinjam", tanggal_kembali: { lt: new Date() } },
    }),
    db.pengembalian.aggregate({ _sum: { denda: true } }),
  ]);

  return {
    jumlahBuku,
    jumlahAnggota,
    sedangDipinjam,
    terlambat,
    totalDenda: Number(totalDendaRaw._sum.denda ?? 0),
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    { label: "Jumlah Buku", value: stats.jumlahBuku },
    { label: "Jumlah Anggota", value: stats.jumlahAnggota },
    { label: "Sedang Dipinjam", value: stats.sedangDipinjam },
    { label: "Buku Terlambat", value: stats.terlambat },
    {
      label: "Total Denda",
      value: new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(stats.totalDenda),
    },
  ];

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Ringkasan kondisi perpustakaan saat ini.</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-sm text-slate-400">
        Modul CRUD Buku, Anggota, Petugas, Peminjaman &amp; Pengembalian akan ditambahkan pada Fase 1
        (lihat <code>docs/roadmap.md</code>).
      </p>
    </div>
  );
}
