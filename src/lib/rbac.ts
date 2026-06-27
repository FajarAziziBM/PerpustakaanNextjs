import type { Role } from "@/lib/auth";

/** Halaman utama yang dituju setelah login, sesuai role. */
export const ROLE_HOME: Record<Role, string> = {
  Admin: "/dashboard",
  Petugas: "/dashboard",
  Anggota: "/portal",
};

/**
 * Daftar prefix route yang dilindungi beserta role yang diizinkan.
 * Dipakai oleh `proxy.ts` untuk pemeriksaan cepat (thin check).
 * Pemeriksaan otoritatif tetap dilakukan di masing-masing layout (Server Component).
 */
export const PROTECTED_ROUTES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/dashboard", roles: ["Admin", "Petugas"] },
  { prefix: "/portal", roles: ["Anggota"] },
];
