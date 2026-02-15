"use client";

import Link from "next/link";
import { Home, LogOut, Inbox } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const router = useRouter();
  const { user, loading } = useAuth();

  // ✅ Ambil role dari JWT token
  const role = user?.role || "Staff";

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
      document.cookie = "accessToken=; path=/; max-age=0";
      document.cookie = "refreshToken=; path=/; max-age=0";
      router.push("/");
    }
  };

  const isKepalaDinas = role === "Kepala Dinas";
  const dashboardRoute = isKepalaDinas
    ? "/monitoring-kadis"
    : "/monitoring-staff";

  if (loading) {
    return (
      <aside className="w-72 min-h-screen bg-blue-900 text-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-700 rounded w-32 mb-10"></div>
          <div className="space-y-3">
            <div className="h-10 bg-blue-700 rounded"></div>
            <div className="h-10 bg-blue-700 rounded"></div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-screen w-72 flex flex-col justify-between
          text-white p-6
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{
          backgroundImage: "url('/sidebar.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h1 className="text-2xl font-bold mb-10">SIMONEVA</h1>

          <nav className="space-y-2">
            <Link
              href={dashboardRoute}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#245CCE] transition"
            >
              <Home size={20} />
              Dashboard Utama
            </Link>

            {/* ✅ Kotak Masuk - Hanya untuk Kepala Dinas */}
            {isKepalaDinas && (
              <Link
                href="/monitoring-kadis/kotak-masuk"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#245CCE] transition"
              >
                <Inbox size={20} />
                Kotak Masuk
              </Link>
            )}
          </nav>
        </div>

        <div className="bg-[#245CCE] p-4 rounded-xl text-sm mt-auto mb-4">
          <p className="font-semibold">
            {isKepalaDinas ? "Kepala Dinas" : "Staff Pelaksana OPD"}
          </p>
          <p className="text-xs opacity-80">{role}</p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl bg-red-700 hover:bg-red-500 transition-all duration-100 border-2 border-red-700 w-full text-left"
        >
          <LogOut size={20} />
          Logout
        </button>
      </aside>
    </>
  );
}
