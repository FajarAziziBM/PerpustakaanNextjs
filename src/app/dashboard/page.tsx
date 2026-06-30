import { db } from "@/lib/db";
import { getChartData } from "@/lib/chart-data";
import { BarChart } from "@/components/charts/bar-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { HBarChart } from "@/components/charts/hbar-chart";

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

const currency = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const [stats, chartData] = await Promise.all([getStats(), getChartData()]);

  const cards = [
    { label: "Jumlah Buku", value: stats.jumlahBuku.toLocaleString("id-ID") },
    { label: "Jumlah Anggota", value: stats.jumlahAnggota.toLocaleString("id-ID") },
    { label: "Sedang Dipinjam", value: stats.sedangDipinjam.toLocaleString("id-ID") },
    {
      label: "Buku Terlambat",
      value: stats.terlambat.toLocaleString("id-ID"),
      highlight: stats.terlambat > 0,
    },
    { label: "Total Denda", value: currency.format(stats.totalDenda) },
  ];

  const totalPeminjaman12 = chartData.monthly.reduce((s, m) => s + m.peminjaman, 0);
  const totalPengembalian12 = chartData.monthly.reduce((s, m) => s + m.pengembalian, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Ringkasan kondisi perpustakaan saat ini.</p>
      </div>

      {/* ── Kartu Statistik ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <p className="text-xs text-slate-500">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold ${
                card.highlight ? "text-red-600" : "text-slate-900"
              }`}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Grafik Peminjaman 12 Bulan ── */}
      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">Peminjaman & Pengembalian</h2>
            <p className="mt-0.5 text-xs text-slate-500">12 bulan terakhir</p>
          </div>
          <div className="flex gap-6 text-sm">
            <span className="text-slate-500">
              Total pinjam:{" "}
              <span className="font-semibold text-slate-900">
                {totalPeminjaman12.toLocaleString("id-ID")}
              </span>
            </span>
            <span className="text-slate-500">
              Total kembali:{" "}
              <span className="font-semibold text-slate-900">
                {totalPengembalian12.toLocaleString("id-ID")}
              </span>
            </span>
          </div>
        </div>
        <div className="mt-4">
          <BarChart data={chartData.monthly} />
        </div>
      </div>

      {/* ── Grafik Bawah: Donut + Top Kategori ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status Peminjaman */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Status Peminjaman</h2>
          <p className="mt-0.5 text-xs text-slate-500">Semua waktu</p>
          <div className="mt-4 flex items-center justify-center">
            <DonutChart
              dipinjam={chartData.statusRatio.dipinjam}
              selesai={chartData.statusRatio.selesai}
            />
          </div>
        </div>

        {/* Top Kategori */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="font-semibold text-slate-900">Top Kategori</h2>
          <p className="mt-0.5 text-xs text-slate-500">Berdasarkan jumlah judul buku</p>
          <div className="mt-4">
            {chartData.topKategori.length > 0 ? (
              <HBarChart data={chartData.topKategori} />
            ) : (
              <p className="text-sm text-slate-400">Belum ada data kategori.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

