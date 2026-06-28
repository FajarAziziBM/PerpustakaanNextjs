import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function PengaturanDendaLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    redirect("/unauthorized");
  }
  return <>{children}</>;
}
