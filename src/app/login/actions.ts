"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/rbac";

export async function loginAction(formData: FormData): Promise<void> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const failUrl = `/login?error=1${next ? `&next=${encodeURIComponent(next)}` : ""}`;

  if (!username || !password) {
    redirect(failUrl);
  }

  const user = await db.users.findUnique({
    where: { username },
    include: { petugas: true, anggota: true },
  });

  if (!user) {
    redirect(failUrl);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    redirect(failUrl);
  }

  const nama: string = user.petugas?.nama ?? user.anggota?.nama ?? user.username;
  const refId: number = user.id_petugas ?? user.id_anggota ?? user.id_user;

  await createSession({
    id_user: user.id_user,
    username: user.username,
    role: user.role,
    nama,
    ref_id: refId,
  });

  await db.users.update({
    where: { id_user: user.id_user },
    data: { last_login: new Date() },
  });

  redirect(next && next.startsWith("/") ? next : ROLE_HOME[user.role]);
}
