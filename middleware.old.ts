import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
  exp?: number;
}

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // Tidak ada token → login
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);

    // ✅ Cek expired token
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      const res = NextResponse.redirect(new URL("/", req.url));
      res.cookies.delete("token");
      res.cookies.set("session_expired", "1", { path: "/" });
      return res;
    }

    /*
      Mapping role → folder kamu:
      /monitoring-gubernur
      /monitoring-kadis
      /monitoring-staff
    */
    const roleToPrefix: Record<string, string[]> = {
      gubernur: ["monitoring-gubernur"],
      kepala_dinas: ["monitoring-kadis"],
      staff: ["monitoring-staff"],
    };

    const currentPath = req.nextUrl.pathname;
    const allowedPrefixes = roleToPrefix[decoded.role];

    // Role tidak dikenali
    if (!allowedPrefixes) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Cek apakah user akses folder yang sesuai role
    const isAllowed = allowedPrefixes.some((prefix) =>
      currentPath.startsWith(`/${prefix}`)
    );

    if (!isAllowed) {
      return NextResponse.redirect(
        new URL(`/${allowedPrefixes[0]}`, req.url)
      );
    }

  } catch (error) {
    console.error("JWT Error:", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api|_next|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|ico)).*)",
  ],
};
