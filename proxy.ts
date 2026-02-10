import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  role: string;
  exp?: number;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  const token = request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization");

  console.log("Middleware - Path:", pathname);
  console.log("Middleware - Token:", token ? "Ada" : "Tidak ada");

  // Belum login
  if (!token) {
    console.log("Middleware - Redirect ke login");
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    const role = decoded.role;

    console.log("Middleware - Role:", role);

    // Mapping role ke folder
    const roleRoutes: Record<string, string> = {
      "Staff": "/monitoring-staff",
      "Kepala Dinas": "/monitoring-kadis",
      "Gubernur": "/monitoring-gubernur",
    };

    const allowedRoute = roleRoutes[role];

    // Role tidak dikenal
    if (!allowedRoute) {
      console.log("Middleware - Role tidak dikenal:", role);
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Kalau buka halaman bukan haknya
    if (!pathname.startsWith(allowedRoute)) {
      console.log(`Middleware - Redirect dari ${pathname} ke ${allowedRoute}`);
      return NextResponse.redirect(new URL(allowedRoute, request.url));
    }

    console.log("Middleware - Access granted");
    return NextResponse.next();
    
  } catch (err) {
    console.error("Middleware - Error:", err);
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    "/monitoring-kadis/:path*",
    "/monitoring-staff/:path*",
    "/monitoring-gubernur/:path*",
  ],
};
