import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Akses Ditolak</h1>
      <p className="max-w-sm text-sm text-slate-500">
        Anda tidak memiliki hak akses untuk membuka halaman ini.
      </p>
      <Link href="/login" className="text-sm font-medium text-brand-600 hover:underline">
        Kembali ke halaman masuk
      </Link>
    </main>
  );
}
