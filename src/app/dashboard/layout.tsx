import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/logout";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/buku", label: "Buku" },
  { href: "/dashboard/kategori", label: "Kategori" },
  { href: "/dashboard/penulis", label: "Penulis" },
  { href: "/dashboard/penerbit", label: "Penerbit" },
  { href: "/dashboard/anggota", label: "Anggota" },
  { href: "/dashboard/petugas", label: "Petugas", adminOnly: true },
];

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  // Pemeriksaan otoritatif — lihat catatan keamanan di src/proxy.ts
  const session = await getSession();
  if (!session) {
    redirect("/login?next=/dashboard");
  }
  if (session.role !== "Admin" && session.role !== "Petugas") {
    redirect("/unauthorized");
  }

  const navItems = NAV_ITEMS.filter((item) => !item.adminOnly || session.role === "Admin");

  return (
    <div className="min-h-screen bg-slate-50 lg:flex">
      <aside className="border-b border-slate-200 bg-white px-4 py-4 lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-3 lg:py-6">
        <p className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">SIPUS</p>
        <nav className="mt-3 flex gap-1 overflow-x-auto lg:mt-4 lg:flex-col lg:overflow-visible">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <p className="font-semibold text-slate-900">
            {session.nama} <span className="text-slate-400">({session.role})</span>
          </p>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-slate-500 hover:text-slate-900">
              Keluar
            </button>
          </form>
        </header>
        <main className="px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
