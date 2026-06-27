import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "sipus_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 jam

export type Role = "Admin" | "Petugas" | "Anggota";

/**
 * Payload yang disimpan di dalam JWT sesi (cookie httpOnly).
 * `ref_id` menyimpan id_petugas atau id_anggota sesuai role, supaya
 * halaman terkait (dashboard/portal) bisa langsung query data terkait
 * tanpa join tambahan ke tabel `users`.
 */
export interface SessionPayload {
  id_user: number;
  username: string;
  role: Role;
  nama: string;
  ref_id: number;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET belum diatur. Tambahkan variabel environment AUTH_SECRET (lihat .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Verifikasi token JWT secara langsung (tanpa membaca cookie store Next.js).
 * Dipakai di `proxy.ts` karena di sana kita hanya punya `NextRequest.cookies`,
 * bukan `next/headers` cookies().
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Validasi otoritatif sesi untuk dipakai di Server Component/Server Action.
 * Lihat catatan keamanan di `proxy.ts` — pengecekan di proxy hanyalah
 * pemeriksaan cepat untuk UX, getSession() di sinilah yang menjadi
 * sumber kebenaran sebelum data sensitif diambil/diubah.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
