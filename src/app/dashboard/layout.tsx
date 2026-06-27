import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/logout";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Pemeriksaan otoritatif — lihat catatan keamanan di src/proxy.ts
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/dashboard");
  }
  if (session.role !== "Admin" && session.role !== "Petugas") {
    redirect("/unauthorized");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">SIPUS</p>
          <p className="font-semibold text-slate-900">
            {session.nama} <span className="text-slate-400">({session.role})</span>
          </p>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
            Keluar
          </button>
        </form>
      </header>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
