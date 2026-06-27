import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { PROTECTED_ROUTES } from "@/lib/rbac";

/**
 * Catatan keamanan (penting):
 * Pengecekan di sini adalah pemeriksaan cepat (thin check) di network boundary,
 * tujuannya hanya untuk redirect awal yang cepat (UX). Proxy/middleware Next.js
 * pernah memiliki celah bypass (CVE-2025-29927 dkk.), sehingga proxy TIDAK BOLEH
 * menjadi satu-satunya lapisan otorisasi. Validasi otoritatif tetap dilakukan
 * ulang di setiap layout/Server Component lewat `getSession()` (lihat
 * src/lib/auth.ts dan src/app/dashboard/layout.tsx, src/app/portal/layout.tsx).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matched = PROTECTED_ROUTES.find((route) => pathname.startsWith(route.prefix));
  if (!matched) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!matched.roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*"],
};
