interface ReportMeta {
  jenis: "buku" | "anggota" | "peminjaman" | "pengembalian" | "denda";
  title: string;
  desc: string;
  withDate: boolean;
}

const REPORTS: ReportMeta[] = [
  {
    jenis: "buku",
    title: "Laporan Buku",
    desc: "Daftar seluruh buku beserta kategori, penulis, penerbit, dan stok.",
    withDate: false,
  },
  {
    jenis: "anggota",
    title: "Laporan Anggota",
    desc: "Daftar seluruh anggota beserta status keanggotaan.",
    withDate: false,
  },
  {
    jenis: "peminjaman",
    title: "Laporan Peminjaman",
    desc: "Seluruh transaksi peminjaman, bisa difilter rentang tanggal pinjam.",
    withDate: true,
  },
  {
    jenis: "pengembalian",
    title: "Laporan Pengembalian",
    desc: "Transaksi pengembalian beserta keterlambatan & denda.",
    withDate: true,
  },
  {
    jenis: "denda",
    title: "Laporan Denda",
    desc: "Khusus transaksi yang dikenakan denda (denda > 0).",
    withDate: true,
  },
];

const dateInputClass = "w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm";

export default function LaporanPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Laporan</h1>
      <p className="mt-1 text-sm text-slate-500">
        Unduh laporan dalam format PDF atau Excel. Filter tanggal bersifat opsional — kosongkan untuk
        menyertakan semua data.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {REPORTS.map((report) => (
          <div key={report.jenis} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="font-semibold text-slate-900">{report.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{report.desc}</p>

            <form action={`/api/laporan/${report.jenis}`} method="GET" className="mt-4 space-y-3">
              {report.withDate && (
                <div className="flex gap-2">
                  <input type="date" name="from" aria-label="Dari tanggal" className={dateInputClass} />
                  <input type="date" name="to" aria-label="Sampai tanggal" className={dateInputClass} />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  name="format"
                  value="pdf"
                  className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Unduh PDF
                </button>
                <button
                  type="submit"
                  name="format"
                  value="excel"
                  className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                >
                  Unduh Excel
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
