import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PetugasSectionLayout({ children }: { children: ReactNode }) {
  // Modul Petugas hanya untuk Admin (PRD §4). Dashboard layout sudah mengizinkan
  // Admin & Petugas masuk ke /dashboard secara umum, jadi perlu pengecekan
  // tambahan di sini agar akun Petugas tidak bisa mengakses modul ini langsung
  // lewat URL meski tidak muncul di navigasi.
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
